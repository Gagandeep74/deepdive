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

// Hook to detect light mode
const useIsLightMode = () => {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light-theme'));
    });
    setIsLight(document.documentElement.classList.contains('light-theme'));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isLight;
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

const ConnectionLine = ({ nodeRef, color, reducedMotion, isLightMode }) => {
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
      lineRef.current.material.opacity = isLightMode ? 0.8 : (0.3 + Math.sin(clock.getElapsedTime() * 4) * 0.2);
    }
  });

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={[0, 0, 0]}
      end={endPos}
      mid={[endPos.x / 2, endPos.y / 2 + 1.5, endPos.z / 2]} // Curve upwards
      color={isLightMode ? '#94a3b8' : color}
      lineWidth={1.5}
      dashed={true}
      dashScale={1}
      dashSize={0.5}
      gapSize={0.5}
      transparent
      opacity={isLightMode ? 0.8 : 0.5}
    />
  );
};

const OrbitingNode = ({ color, radius, speed, offset, reducedMotion, name, isLightMode }) => {
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
          {isLightMode ? (
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
          ) : (
            <meshBasicMaterial color={color} />
          )}
        </Sphere>
        {/* Wireframe outer shell */}
        <Icosahedron args={[0.35, 1]}>
          <meshBasicMaterial color={isLightMode ? '#cbd5e1' : color} wireframe transparent opacity={isLightMode ? 0.8 : 0.5} />
        </Icosahedron>
      </group>
      
      {/* Agent Name Label */}
      <Html position={[0, -0.7, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div style={{ color: color, background: 'transparent', padding: 0, margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 'bold', textShadow: isLightMode ? 'none' : `0 0 10px ${color}, 0 0 20px ${color}`, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {name}
        </div>
      </Html>
      
      {/* Agent Glow */}
      {!isLightMode && <GlowSprite color={color} scale={0.8} opacity={0.6} />}
      
      {/* Connection back to center */}
      <ConnectionLine nodeRef={groupRef} color={color} reducedMotion={reducedMotion} isLightMode={isLightMode} />
    </group>
  );
};

const SceneContainer = ({ isLightMode }) => {
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
      <ambientLight intensity={isLightMode ? 1.5 : 0.2} />
      <directionalLight position={[10, 10, 10]} intensity={isLightMode ? 2.5 : 0.5} />

      {/* --- CORE --- */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Outer Wireframe */}
        <Icosahedron args={[1.5, 2]}>
          <meshBasicMaterial color={isLightMode ? '#e2e8f0' : '#6c5ce7'} wireframe transparent opacity={isLightMode ? 0.6 : 0.2} />
        </Icosahedron>
        
        {/* Inner Solid */}
        <Icosahedron args={[1.2, 3]}>
          {isLightMode ? (
            <meshPhysicalMaterial color="#ffffff" metalness={0.1} roughness={0.1} clearcoat={1.0} clearcoatRoughness={0.1} />
          ) : (
            <meshBasicMaterial color="#0A0A0F" />
          )}
        </Icosahedron>

        {/* Core Label */}
        <Html position={[0, -2.2, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <div style={{ color: isLightMode ? '#475569' : '#a78bfa', background: 'transparent', padding: 0, margin: 0, fontFamily: 'monospace', fontSize: '1rem', fontWeight: 'bold', textShadow: isLightMode ? 'none' : '0 0 10px #a78bfa, 0 0 20px #a78bfa', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Orchestrator
          </div>
        </Html>

        {/* Core Glow */}
        {!isLightMode && <GlowSprite color="#6c5ce7" scale={2.5} opacity={0.4} />}

        {/* Tech Rings */}
        <Torus args={[2.2, 0.01, 32, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={isLightMode ? '#cbd5e1' : '#a78bfa'} transparent opacity={isLightMode ? 0.8 : 0.15} />
        </Torus>
        <Torus args={[2.8, 0.01, 32, 64]} rotation={[0, Math.PI / 4, 0]}>
          <meshBasicMaterial color={isLightMode ? '#cbd5e1' : '#06b6d4'} transparent opacity={isLightMode ? 0.8 : 0.15} />
        </Torus>
      </Float>

      {/* --- AMBIENT PARTICLES --- */}
      {!reducedMotion && (
        <Sparkles count={200} scale={14} size={isLightMode ? 1.5 : 2} speed={0.4} opacity={isLightMode ? 0.6 : 0.2} color={isLightMode ? '#94a3b8' : '#a78bfa'} />
      )}

      {/* --- AGENTS --- */}
      <OrbitingNode name="Planner" color={AGENT_COLORS.planner} radius={4} speed={0.35} offset={0} reducedMotion={reducedMotion} isLightMode={isLightMode} />
      <OrbitingNode name="Researcher" color={AGENT_COLORS.researcher} radius={5} speed={0.25} offset={Math.PI / 2} reducedMotion={reducedMotion} isLightMode={isLightMode} />
      <OrbitingNode name="Synthesizer" color={AGENT_COLORS.synthesizer} radius={6} speed={0.15} offset={Math.PI} reducedMotion={reducedMotion} isLightMode={isLightMode} />
      <OrbitingNode name="Critic" color={AGENT_COLORS.critic} radius={7} speed={0.4} offset={(Math.PI * 3) / 2} reducedMotion={reducedMotion} isLightMode={isLightMode} />
    </group>
  );
};

export default function AgentSwarmScene() {
  const isLightMode = useIsLightMode();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: 0, 
      pointerEvents: 'none'
    }}>
      {/* Remove manual background color so it perfectly composites over the DOM starfield */}
      <Canvas eventSource={document.body} eventPrefix="client" camera={{ position: [0, 0, 14], fov: 45 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <SceneContainer isLightMode={isLightMode} />
      </Canvas>
    </div>
  );
}
