
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot, Sparkles, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const useIsLightMode = () => {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light-theme"));
    });
    setIsLight(document.documentElement.classList.contains("light-theme"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isLight;
};

const AbstractCore = () => {
  const knotRef = useRef();
  const isLight = useIsLightMode();

  useFrame((state, delta) => {
    knotRef.current.rotation.x += delta * 0.1;
    knotRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <TorusKnot ref={knotRef} args={[2.5, 0.8, 128, 32]} scale={1.2}>
          <MeshDistortMaterial 
            color={isLight ? "#4338CA" : "#6c5ce7"} 
            emissive={isLight ? "#5B48D9" : "#a29bfe"} 
            emissiveIntensity={isLight ? 0.2 : 0.8}
            wireframe={true} 
            distort={0.3}
            speed={2}
          />
        </TorusKnot>
      </Float>
      <Float speed={2} rotationIntensity={2} floatIntensity={3}>
        <Sphere args={[1.5, 32, 32]}>
          <meshPhysicalMaterial 
            color={isLight ? "#10B981" : "#06b6d4"} 
            emissive={isLight ? "#34D399" : "#00d2d3"}
            emissiveIntensity={isLight ? 0.3 : 1}
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.1} 
            ior={1.5} 
            thickness={2} 
          />
        </Sphere>
      </Float>
      <Sparkles count={300} scale={15} size={isLight ? 4 : 2} speed={0.4} opacity={isLight ? 0.4 : 0.8} color={isLight ? "#D97706" : "#f59e0b"} />
    </group>
  );
};

export default function AboutScene() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <AbstractCore />
      </Canvas>
    </div>
  );
}

