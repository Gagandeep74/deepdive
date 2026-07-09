import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Icosahedron, QuadraticBezierLine, Sparkles, Torus, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

const AGENT_COLORS = {
  planner: '#6c5ce7', // Violet
  researcher: '#06b6d4', // Cyan
  synthesizer: '#10b981', // Emerald
  critic: '#f59e0b', // Amber
};

// Hook to detect touch devices
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
};

// Hook to detect reduced motion
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

// Glow Texture generator (creates a radial gradient once)
const useGlowTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);
};

// Fake Glow Sprite
const GlowSprite = ({ color, scale = 1, opacity = 0.5 }) => {
  const texture = useGlowTexture();
  const ref = useRef();
  
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[scale * 4, scale * 4]} />
      <meshBasicMaterial 
        map={texture} 
        color={color} 
        transparent 
        opacity={opacity} 
        opacity={opacity} 
        depthWrite={false} 
      />
    </mesh>
  );
};

const ConnectionLine = ({ nodeRef, color, reducedMotion }) => {
  const lineRef = useRef();
  const [endPos, setEndPos] = useState(new THREE.Vector3(0, 0, 0));
  
  useFrame(({ clock }) => {
    if (nodeRef.current) {
      const currentPos = new THREE.Vector3();
      nodeRef.current.getWorldPosition(currentPos);
      setEndPos(currentPos);
    }
    
    // Animate dashed line offset to look like data flowing
    if (lineRef.current && lineRef.current.material && !reducedMotion) {
      lineRef.current.material.dashOffset -= 0.02;
      // Also pulse opacity slightly
      lineRef.current.material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 4) * 0.2;
    }
  });

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={[0, 0, 0]}
      end={endPos}
      mid={[endPos.x / 2, endPos.y / 2 + 1.5, endPos.z / 2]} // Curve upwards
      color={color}
      lineWidth={1.5}
      dashed={true}
      dashScale={1}
      dashSize={0.5}
      gapSize={0.5}
      transparent
      opacity={0.5}
    />
  );
};

const OrbitingNode = ({ color, radius, speed, offset, reducedMotion, name }) => {
  const ref = useRef();
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 1.5) * (radius * 0.15); // Slight bobbing
    
    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={ref}>
        {/* Solid inner core */}
        <Sphere args={[0.2, 32, 32]}>
          <meshBasicMaterial color={color} />
        </Sphere>
        {/* Wireframe outer shell */}
        <Icosahedron args={[0.35, 1]}>
          <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
        </Icosahedron>
      </group>
      
      {/* Agent Name Label */}
      <Html position={[0, -0.7, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div style={{ color: color, background: 'transparent', padding: 0, margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 'bold', textShadow: `0 0 10px ${color}, 0 0 20px ${color}`, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {name}
        </div>
      </Html>
      
      {/* Agent Glow */}
      <GlowSprite color={color} scale={0.8} opacity={0.6} />
      
      {/* Connection back to center */}
      <ConnectionLine nodeRef={groupRef} color={color} reducedMotion={reducedMotion} />
    </group>
  );
};

const SceneContainer = () => {
  const groupRef = useRef();
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x += delta * 0.05;
    }

    if (!isTouch && !reducedMotion && groupRef.current) {
      const targetX = (state.pointer.y * Math.PI) / 10;
      const targetY = (state.pointer.x * Math.PI) / 10;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- CORE --- */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Outer Wireframe */}
        <Icosahedron args={[1.5, 2]}>
          <meshBasicMaterial color="#6c5ce7" wireframe transparent opacity={0.2} />
        </Icosahedron>
        
        {/* Inner Solid */}
        <Icosahedron args={[1.2, 3]}>
          <meshBasicMaterial color="#0A0A0F" />
        </Icosahedron>

        {/* Core Glow */}
        <GlowSprite color="#6c5ce7" scale={2.5} opacity={0.4} />

        {/* Tech Rings */}
        <Torus args={[2.2, 0.01, 32, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} />
        </Torus>
        <Torus args={[2.8, 0.01, 32, 64]} rotation={[0, Math.PI / 4, 0]}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} />
        </Torus>
      </Float>

      {/* --- AMBIENT PARTICLES --- */}
      {!reducedMotion && (
        <Sparkles count={200} scale={14} size={2} speed={0.4} opacity={0.2} color="#a78bfa" />
      )}

      {/* --- AGENTS --- */}
      <OrbitingNode name="Planner" color={AGENT_COLORS.planner} radius={4} speed={0.35} offset={0} reducedMotion={reducedMotion} />
      <OrbitingNode name="Researcher" color={AGENT_COLORS.researcher} radius={5} speed={0.25} offset={Math.PI / 2} reducedMotion={reducedMotion} />
      <OrbitingNode name="Synthesizer" color={AGENT_COLORS.synthesizer} radius={6} speed={0.15} offset={Math.PI} reducedMotion={reducedMotion} />
      <OrbitingNode name="Critic" color={AGENT_COLORS.critic} radius={7} speed={0.4} offset={(Math.PI * 3) / 2} reducedMotion={reducedMotion} />
    </group>
  );
};

export default function AgentSwarmScene() {
  return (
    <div style={{ width: '100%', height: '500px', margin: '40px auto 80px', position: 'relative', zIndex: 10 }}>
      {/* Remove manual background color so it perfectly composites over the DOM starfield */}
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <SceneContainer />
      </Canvas>
    </div>
  );
}
