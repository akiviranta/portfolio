import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// Configuration
const CONFIG = {
  world: {
    size: 100,
    color: '#000000',
  },
  ball: {
    radius: 2,
    color: '#cccccc',
    emissiveIntensity: 1,
    lightIntensity: 500,
    lightDistance: 30,
    speed: 20,
  },
  camera: {
    position: [0, 15, 20],
    fov: 60,
  },
};

// Ground
const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry args={[CONFIG.world.size, CONFIG.world.size]} />
      <meshStandardMaterial color={CONFIG.world.color} />
    </mesh>
  );
};

// Player ball with light
const Ball = () => {
  const [physicsRef, api] = useSphere(() => ({
    mass: 1,
    args: [CONFIG.ball.radius],
    position: [0, 2, 0],
  }));

  const visualRef = useRef();
  const directionalLightRef = useRef();
  const positionRef = useRef([0, 2, 0]);
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

  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      positionRef.current = p;
    });
    return unsubscribe;
  }, [api]);

  useFrame(() => {
    let vx = 0;
    let vz = 0;

    if (keys.current.w) vz -= CONFIG.ball.speed;
    if (keys.current.s) vz += CONFIG.ball.speed;
    if (keys.current.a) vx -= CONFIG.ball.speed;
    if (keys.current.d) vx += CONFIG.ball.speed;

    api.velocity.set(vx, 0, vz);

    // Update visual position and rotation
    if (visualRef.current) {
      visualRef.current.position.set(...positionRef.current);

      const velocityMagnitude = Math.sqrt(vx * vx + vz * vz);
      if (velocityMagnitude > 0) {
        const rollSpeed = velocityMagnitude * 0.01;
        visualRef.current.rotateOnAxis(new THREE.Vector3(-vz, 0, vx).normalize(), rollSpeed);

        // Position directional light in movement direction
        if (directionalLightRef.current) {
          const lightDistance = CONFIG.ball.radius * 3;
          directionalLightRef.current.position.set(vx, 0, vz).normalize().multiplyScalar(lightDistance);
        }
      }
    }
  });

  return (
    <group ref={visualRef}>
      <pointLight
        intensity={CONFIG.ball.lightIntensity}
        distance={CONFIG.ball.lightDistance}
        color={CONFIG.ball.color}
      />
      <directionalLight
        ref={directionalLightRef}
        intensity={2}
        color="#ffffff"
      />
      <mesh>
        <sphereGeometry args={[CONFIG.ball.radius, 32, 32]} />
        <meshStandardMaterial
          color={CONFIG.ball.color}
          emissive={CONFIG.ball.color}
          emissiveIntensity={0.3}
          roughness={0.7}
        />
      </mesh>
      <mesh ref={physicsRef} visible={false}>
        <sphereGeometry args={[CONFIG.ball.radius]} />
      </mesh>
    </group>
  );
};

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: CONFIG.camera.position, fov: CONFIG.camera.fov }}
        style={{ width: '100%', height: '100%', background: CONFIG.world.color }}
      >
        <Physics gravity={[0, -20, 0]}>
          <Ground />
          <Ball />
        </Physics>
      </Canvas>

      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Controls</p>
        <p style={{ fontSize: '14px' }}>WASD - Move</p>
      </div>
    </div>
  );
};

export default App;
