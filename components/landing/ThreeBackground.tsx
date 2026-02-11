"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment, ContactShadows, useGLTF, Center, Sparkles } from "@react-three/drei";

const FuturisticShape = () => {
  const { scene } = useGLTF("/3d/formula.glb"); 
  return <primitive object={scene} />;
};

const ThreeBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-screen -z-10 pointer-events-none">
      <Canvas 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.5, 6], fov: 45 }} 
        style={{ width: '100vw', height: '100vh' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ff8866" />
        <spotLight position={[-5, 5, 0]} intensity={10} color="#ff3300" distance={20} />

        <Float 
          speed={2} 
          rotationIntensity={0.5}
          floatIntensity={1} 
          floatingRange={[-0.2, 0.2]}
        >
          <Suspense fallback={null}>
            <Center position={[0, 0, 0]}>
              <group 
                scale={0.8} 
                rotation={[0.1, 0.6, 0]} 
              > 
                <FuturisticShape />
                
                <Sparkles 
                  count={300}        
                  scale={6}          
                  size={8}          
                  speed={0.4}        
                  opacity={0.8} 
                  color="#ff2200"    
                  noise={0.5}
                />
              </group>
            </Center>
          </Suspense>
        </Float>

        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.7} 
          scale={15} 
          blur={2.5} 
          far={4} 
          color="#ff0000" 
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

useGLTF.preload("/3d/formula.glb");

export default ThreeBackground;