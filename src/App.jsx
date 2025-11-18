import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// ==================== CONFIGURATION ====================
const TEXTURES = {
  ground: '#000000',      // Dark blue-gray
  ball: '#00ff88',        // Cyan-green
  gridColor: '#ffffff',   // Cyan
};

// ==================== COMPONENTS ====================

// Ground plane
const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
        color="#000000"
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
};

// Player ball
const Ball = () => {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [1],
    position: [0, 2, 0],
  }));

  const meshRef = useRef();
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 20;
    let vx = 0;
    let vz = 0;

    if (keys.current.w) vz -= speed;
    if (keys.current.s) vz += speed;
    if (keys.current.a) vx -= speed;
    if (keys.current.d) vx += speed;

    api.velocity.set(vx, 0, vz);

    // Sync mesh with physics body
    if (ref.current) {
      meshRef.current.position.copy(ref.current.position);
      meshRef.current.quaternion.copy(ref.current.quaternion);
    }

    // Rolling animation based on velocity
    if (meshRef.current) {
      const velocityMagnitude = Math.sqrt(vx * vx + vz * vz);
      const rollAxis = new THREE.Vector3(-vz, 0, vx).normalize();
      const rollSpeed = velocityMagnitude * 0.05;
      
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(rollAxis, rollSpeed);
      meshRef.current.quaternion.multiplyQuaternions(quaternion, meshRef.current.quaternion);
    }
  });

  return (
    <>
      <pointLight position={[0, 0, 0]} intensity={2} distance={30} color="#ffffff" />
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={TEXTURES.ball}
          emissive="#00ff88"
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  );
};

// ==================== MAIN APP ====================
const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 15, 20], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.05} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.05}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Grid helper for reference */}
        <gridHelper args={[100, 50, TEXTURES.gridColor, TEXTURES.gridColor]} />

        {/* Physics */}
        <Physics gravity={[0, -20, 0]}>
          <Ground />
          <Ball />
        </Physics>
      </Canvas>

      {/* Controls UI */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '16px',
        borderRadius: '8px'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Controls</p>
        <p style={{ fontSize: '14px' }}>WASD - Move</p>
      </div>
    </div>
  );
};

export default App;