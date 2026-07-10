
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Box, Edges } from "@react-three/drei";
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

const DataMatrix = () => {
  const isLight = useIsLightMode();
  const groupRef = useRef();

  // Create a grid of cubes
  const cubes = useMemo(() => {
    const temp = [];
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        temp.push({ position: [x * 1.8, (Math.random() - 0.5) * 2, z * 1.8], delay: Math.random() * Math.PI * 2 });
      }
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    
    // Animate children (cubes)
    groupRef.current.children.forEach((child, i) => {
      const delay = cubes[i].delay;
      child.position.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.8;
      child.rotation.x += delta * 0.2;
      child.rotation.y += delta * 0.3;
    });
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {cubes.map((cube, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Box args={[0.8, 0.8, 0.8]} position={cube.position}>
            <meshPhysicalMaterial 
              color={isLight ? "#4338CA" : "#06b6d4"} 
              transmission={0.8} 
              opacity={1} 
              transparent 
              roughness={0.2} 
              metalness={0.1}
            />
            <Edges scale={1.05} threshold={15} color={isLight ? "#5B48D9" : "#6c5ce7"} />
          </Box>
        </Float>
      ))}
    </group>
  );
};

export default function DocsScene() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={2} />
        <DataMatrix />
      </Canvas>
    </div>
  );
}

