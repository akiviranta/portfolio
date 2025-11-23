import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import RobotArm from './components/objects/RoboArm';
import Ball from './components/player/Ball';
import FloatingText from './components/world/FloatingText';
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
  const [currentUrl, setCurrentUrl] = useState("https://example.com"); // Default or dynamic

  // Shared ref to track ball position without re-renders
  const ballPosRef = useRef(new THREE.Vector3(0, 0, 0));

  // Robot Arm Position (End of Education path)
  // Education is Southeast: (+X, +Z)
  // Let's say length is 100.
  // Angle is 45 degrees (PI/4).
  // X = 100 * cos(45) ≈ 70.7
  // Z = 100 * sin(45) ≈ 70.7
  // Start point is at radius 10.
  // Start X = 10 * cos(45) ≈ 7.07
  // Start Z = 10 * sin(45) ≈ 7.07

  const PATH_LENGTH = 100;
  const HUB_RADIUS = 20; // 2x bigger
  const OFFSET = HUB_RADIUS / Math.sqrt(2);
  const END_OFFSET = (HUB_RADIUS + PATH_LENGTH) / Math.sqrt(2);

  // Pulse Synchronization
  // Sweep goes from 0 to 1 over time.
  // Angle 0 is +X (East).
  // Sweep rotates counter-clockwise?
  // atan(y, x) returns angle.
  // Education (SE): +X, +Z. Angle = -PI/4 (or 7PI/4).
  // Wait, standard Math.atan2(y, x):
  // SE: (+1, +1) -> PI/4 (45 deg)
  // NE: (+1, -1) -> -PI/4 (-45 deg)
  // NW: (-1, -1) -> -3PI/4 (-135 deg)
  // SW: (-1, +1) -> 3PI/4 (135 deg)

  // SweepMaterial logic:
  // angle = atan(y, x)
  // normalizedAngle = (angle + PI) / (2PI) -> 0 to 1
  // -PI -> 0
  // 0 -> 0.5
  // PI -> 1

  // SE (45 deg, PI/4): (PI/4 + PI) / 2PI = 1.25PI / 2PI = 0.625
  // NE (-45 deg, -PI/4): (-PI/4 + PI) / 2PI = 0.75PI / 2PI = 0.375
  // NW (-135 deg, -3PI/4): (-3PI/4 + PI) / 2PI = 0.25PI / 2PI = 0.125
  // SW (135 deg, 3PI/4): (3PI/4 + PI) / 2PI = 1.75PI / 2PI = 0.875

  // Pulse logic: mod((time + offset) * speed, 1.0)
  // We want pulse to start (be at 0) when sweep hits the angle.
  // Sweep hits angle when time * speed % 1.0 == angle_fraction
  // So we want the stripe pulse to be at 0 at that time.
  // (time + offset) * speed % 1.0 == 0
  // time * speed = angle_fraction
  // (angle_fraction / speed + offset) * speed = 0 (mod 1)
  // angle_fraction + offset * speed = 0 (mod 1)
  // offset * speed = -angle_fraction
  // offset = -angle_fraction / speed

  // Let's assume speed is same for both (0.5).
  // offset = -angle_fraction

  const SPEED = 0.1; // Slowed down for readability

  // Corrected Angle Logic:
  // Mesh is rotated -PI/2 on X.
  // So Mesh Y corresponds to World -Z (North).
  // Mesh X corresponds to World +X (East).
  // atan(y, x) -> atan(-Z, X)

  // Education (SE): +X, +Z. atan(-1, 1) = -PI/4.
  // Fraction: (-0.25 + 1) / 2 = 0.375.

  // Athletics (NW): -X, -Z. atan(1, -1) = 3PI/4.
  // Fraction: (0.75 + 1) / 2 = 0.875.

  // Professional (SW): -X, +Z. atan(-1, -1) = -3PI/4.
  // Fraction: (-0.75 + 1) / 2 = 0.125.

  // Blog (NE): +X, -Z. atan(1, 1) = PI/4.
  // Fraction: (0.25 + 1) / 2 = 0.625.

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
              onOpenBlog={() => setBlogOpen(true)}
              playerPosRef={ballPosRef}
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
        onClose={() => setBlogOpen(false)}
        url={currentUrl}
      />
    </div>
  );
};

export default App;
