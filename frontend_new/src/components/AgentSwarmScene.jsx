import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Icosahedron, QuadraticBezierLine } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Constants for our 4 agents
const AGENT_COLORS = {
  planner: '#6c5ce7', // Violet
  researcher: '#06b6d4', // Cyan
  synthesizer: '#10b981', // Emerald
  critic: '#f59e0b', // Amber
};

// Hook to detect touch devices (for disabling parallax)
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
};

// Hook to detect reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
};

const OrbitingNode = ({ color, radius, speed, offset, reducedMotion }) => {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    if (reducedMotion) return; // Don't orbit if reduced motion
    const t = clock.getElapsedTime() * speed + offset;
    // Calculate orbit path (elliptical/circular on XZ plane with some Y variance)
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 2) * (radius * 0.3); // Slight bobbing
    
    if (ref.current) {
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <group ref={ref}>
      <Sphere args={[0.3, 32, 32]}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </Sphere>
      
      {/* Animated connection line back to center */}
      <ConnectionLine nodeRef={ref} color={color} reducedMotion={reducedMotion} />
    </group>
  );
};

const ConnectionLine = ({ nodeRef, color, reducedMotion }) => {
  const lineRef = useRef();
  const [endPos, setEndPos] = useState(new THREE.Vector3(0, 0, 0));
  
  useFrame(({ clock }) => {
    if (nodeRef.current) {
      // Update line end position to match the orbiting node
      const currentPos = new THREE.Vector3();
      nodeRef.current.getWorldPosition(currentPos);
      setEndPos(currentPos);
    }
    
    if (lineRef.current && lineRef.current.material && !reducedMotion) {
      // Pulse opacity
      const opacity = 0.2 + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={[0, 0, 0]}
      end={endPos}
      mid={[endPos.x / 2, endPos.y / 2 + 1, endPos.z / 2]} // Curve slightly upwards
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.3}
    />
  );
};

const SceneContainer = () => {
  const groupRef = useRef();
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();

  // Slow ambient rotation of the entire scene
  useFrame((state, delta) => {
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }

    // Mouse parallax effect (desktop only)
    if (!isTouch && !reducedMotion && groupRef.current) {
      // Target rotation based on mouse coordinates (-1 to 1)
      const targetX = (state.pointer.y * Math.PI) / 8;
      const targetY = (state.pointer.x * Math.PI) / 8;
      
      // Smoothly interpolate towards target
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Center Core (Orchestrator) */}
      <Icosahedron args={[1.5, 4]}>
        <MeshDistortMaterial
          color="#3b3b4f"
          emissive="#6c5ce7"
          emissiveIntensity={0.2}
          wireframe={true}
          distort={reducedMotion ? 0 : 0.4}
          speed={reducedMotion ? 0 : 2}
          roughness={0.2}
          metalness={0.8}
        />
      </Icosahedron>
      
      {/* Inner solid core to give wireframe some body */}
      <Sphere args={[1.2, 32, 32]}>
        <meshBasicMaterial color="#0A0A0F" />
      </Sphere>

      {/* Orbiting Agents */}
      <OrbitingNode color={AGENT_COLORS.planner} radius={3.5} speed={0.4} offset={0} reducedMotion={reducedMotion} />
      <OrbitingNode color={AGENT_COLORS.researcher} radius={4.5} speed={0.3} offset={Math.PI / 2} reducedMotion={reducedMotion} />
      <OrbitingNode color={AGENT_COLORS.synthesizer} radius={5.5} speed={0.2} offset={Math.PI} reducedMotion={reducedMotion} />
      <OrbitingNode color={AGENT_COLORS.critic} radius={6.5} speed={0.35} offset={(Math.PI * 3) / 2} reducedMotion={reducedMotion} />
    </group>
  );
};

export default function AgentSwarmScene() {
  return (
    <div style={{ width: '100%', height: '500px', margin: '40px auto 80px', position: 'relative', zIndex: 10 }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} dpr={[1, 2]}>
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <SceneContainer />
        
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
