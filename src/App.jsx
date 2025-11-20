import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import RobotArm from './RoboArm';
import Ball from './Ball';
import FloatingText from './FloatingText';
import NavigationStripe from './NavigationStripe';

// Configuration
const CONFIG = {
  world: {
    size: 1000,
    color: '#000000',
    ambientLightIntensity: 0.01,
  },
  camera: {
    position: [0, 40, 40], // Further out and up
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

const App = () => {
  // Robot Arm Position
  const robotArmPos = [40, 0, 40];

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: CONFIG.camera.position, fov: CONFIG.camera.fov }}
        style={{ width: '100%', height: '100%', background: CONFIG.world.color }}
      >
        <ambientLight intensity={CONFIG.world.ambientLightIntensity} />
        <Physics gravity={[0, -20, 0]}>
          <Ground />
          <Ball />

          {/* Spawn Area Text */}
          <FloatingText
            text="Arttu Kiviranta"
            position={[0, 0.1, -5]}
            size={3}
            color="#ffffff"
          />

          {/* Navigation to Robot Arm */}
          <NavigationStripe
            start={[8, 0.05, 8]}
            end={robotArmPos}
            width={4}
            label="Education"
            pulseSpeed={0.3}
          />

          <RobotArm position={robotArmPos} />
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
