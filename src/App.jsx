import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import RobotArm from './components/objects/RoboArm';
import Ball from './components/player/Ball';
import NavigationStripe from './components/world/NavigationStripe';
import SpawnCircle from './components/world/SpawnCircle';
import BlogOverlay from './components/ui/BlogOverlay';

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
  const [blogOpen, setBlogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  // Shared ref to track ball position without re-renders
  const ballPosRef = useRef(new THREE.Vector3(0, 0, 0));

  // Robot Arm Position (End of Education path)
  const PATH_LENGTH = 100;
  const HUB_RADIUS = 20; // 2x bigger
  const OFFSET = HUB_RADIUS / Math.sqrt(2);
  const END_OFFSET = (HUB_RADIUS + PATH_LENGTH) / Math.sqrt(2);

  const SPEED = 0.1; // Slowed down for readability

  const getOffset = (angleFraction) => {
    // offset * speed = -angleFraction
    return -angleFraction / SPEED;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: CONFIG.camera.position, fov: CONFIG.camera.fov }}
        style={{ width: '100%', height: '100%', background: CONFIG.world.color }}
      >
        <ambientLight intensity={CONFIG.world.ambientLightIntensity} />
        <Physics gravity={[0, -20, 0]}>
          <Ground />
          <Ball ballPosRef={ballPosRef} />

          {/* Central Hub */}
          <SpawnCircle radius={HUB_RADIUS} speed={SPEED} />

          {/* Education (Southeast: +X, +Z) -> Fraction 0.375 */}
          <NavigationStripe
            start={[OFFSET, 0.05, OFFSET]}
            end={[END_OFFSET, 0, END_OFFSET]}
            width={6}
            label="Education"
            pulseSpeed={SPEED}
            pulseOffset={getOffset(0.375)}
          >
            <RobotArm
              position={[0, 0, 0]}
              onOpenBlog={() => {
                setBlogOpen(true);
                setActiveProject("roboarm");
              }}
              playerPosRef={ballPosRef}
              isBlogOpen={blogOpen}
            />
          </NavigationStripe>

          {/* Athletics (Northwest: -X, -Z) -> Fraction 0.875 */}
          <NavigationStripe
            start={[-OFFSET, 0.05, -OFFSET]}
            end={[-END_OFFSET, 0, -END_OFFSET]}
            width={6}
            label="Athletics"
            pulseSpeed={SPEED}
            pulseOffset={getOffset(0.875)}
          />

          {/* Professional (Southwest: -X, +Z) -> Fraction 0.125 */}
          <NavigationStripe
            start={[-OFFSET, 0.05, OFFSET]}
            end={[-END_OFFSET, 0, END_OFFSET]}
            width={6}
            label="Professional"
            pulseSpeed={SPEED}
            pulseOffset={getOffset(0.125)}
          />

          {/* Blog (Northeast: +X, -Z) -> Fraction 0.625 */}
          <NavigationStripe
            start={[OFFSET, 0.05, -OFFSET]}
            end={[END_OFFSET, 0, -END_OFFSET]}
            width={6}
            label="Blog"
            pulseSpeed={SPEED}
            pulseOffset={getOffset(0.625)}
          />
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
        pointerEvents: 'none', // Let clicks pass through
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Controls</p>
        <p style={{ fontSize: '14px' }}>WASD - Move</p>
      </div>

      <BlogOverlay
        isOpen={blogOpen}
        onClose={() => {
          setBlogOpen(false);
          setActiveProject(null);
        }}
        initialProject={activeProject}
      />
    </div>
  );
};

export default App;
