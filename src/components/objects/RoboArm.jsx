import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// SO-101 Robot Arm Component
const RobotArm = ({ position = [20, 0, 20], onOpenBlog, playerPosRef }) => {
  const baseRef = useRef();
  const segment1Ref = useRef();
  const segment2Ref = useRef();
  const gripperRef = useRef();
  const cubeRef = useRef();
  const groupRef = useRef();

  const animationPhase = useRef(0);
  const objectOnRight = useRef(true);
  const phaseTime = useRef(0);
  const lastAngle = useRef(0);
  const isFirstLoop = useRef(true);

  // Interaction State
  const [inRange, setInRange] = useState(false);
  const { camera } = useThree();

  // Object positions
  const rightPos = [-1.8, 0.4, 5.5];
  const leftPos = [-1.8, 0.4, -5.5];

  useFrame((state, delta) => {
    // Proximity Check
    if (groupRef.current && playerPosRef) {
      // We need world position of the arm group
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);

      // Check distance to player (ball) instead of camera
      const dist = worldPos.distanceTo(playerPosRef.current);

      if (dist < 15) { // Activation range
        if (!inRange) setInRange(true);
      } else {
        if (inRange) setInRange(false);
      }
    }

    phaseTime.current += delta;

    // Animation cycle: 0=idle, 1=rotate to pickup, 2=reach down, 3=grab, 4=lift, 5=rotate to place, 6=lower, 7=release
    const phaseDurations = [0.5, 1, 1, 0.3, 1, 1.5, 1, 0.3];

    if (phaseTime.current > phaseDurations[animationPhase.current]) {
      phaseTime.current = 0;
      if (animationPhase.current === 7) {
        // Capture the final rotation before resetting
        if (baseRef.current) {
          lastAngle.current = baseRef.current.rotation.y;
        }
        isFirstLoop.current = false;
        objectOnRight.current = !objectOnRight.current;
        animationPhase.current = 0;
      } else {
        animationPhase.current += 1;
      }
    }

    const t = phaseTime.current / phaseDurations[animationPhase.current];
    const eased = Math.sin(t * Math.PI * 0.5);

    const pickupAngle = objectOnRight.current ? Math.PI * 0.4 : -Math.PI * 0.4;
    const placeAngle = objectOnRight.current ? -Math.PI * 0.4 : Math.PI * 0.4;

    // Base rotation
    if (baseRef.current) {
      if (animationPhase.current === 0) {
        baseRef.current.rotation.y = lastAngle.current;
      } else if (animationPhase.current === 1) {
        baseRef.current.rotation.y = lastAngle.current + eased * (pickupAngle - lastAngle.current);
      } else if (animationPhase.current >= 2 && animationPhase.current <= 3) {
        baseRef.current.rotation.y = pickupAngle;
      } else if (animationPhase.current === 4) {
        baseRef.current.rotation.y = pickupAngle;
      } else if (animationPhase.current === 5) {
        baseRef.current.rotation.y = pickupAngle + eased * (placeAngle - pickupAngle);
      } else if (animationPhase.current >= 6) {
        baseRef.current.rotation.y = placeAngle;
      }
    }

    // First segment (shoulder)
    if (segment1Ref.current) {
      if (animationPhase.current === 0) {
        segment1Ref.current.rotation.z = isFirstLoop.current ? 0 : (1 - eased) * Math.PI * 0.5;
      } else if (animationPhase.current === 1) {
        segment1Ref.current.rotation.z = 0;
      } else if (animationPhase.current === 2) {
        segment1Ref.current.rotation.z = eased * Math.PI * 0.5;
      } else if (animationPhase.current === 3) {
        segment1Ref.current.rotation.z = Math.PI * 0.5;
      } else if (animationPhase.current === 4) {
        segment1Ref.current.rotation.z = (1 - eased) * Math.PI * 0.5;
      } else if (animationPhase.current === 5) {
        segment1Ref.current.rotation.z = 0;
      } else if (animationPhase.current === 6) {
        segment1Ref.current.rotation.z = eased * Math.PI * 0.5;
      } else if (animationPhase.current === 7) {
        segment1Ref.current.rotation.z = Math.PI * 0.5;
      } else if (animationPhase.current === 8) {
        segment1Ref.current.rotation.z = (1 - eased) * Math.PI * 0.5;
      } else if (animationPhase.current === 9) {
        segment1Ref.current.rotation.z = 0;
      }
    }

    // Second segment (elbow)
    if (segment2Ref.current) {
      if (animationPhase.current === 0) {
        segment2Ref.current.rotation.z = isFirstLoop.current ? 0 : (1 - eased) * Math.PI * 0.1;
      } else if (animationPhase.current === 1) {
        segment2Ref.current.rotation.z = 0;
      } else if (animationPhase.current === 2) {
        segment2Ref.current.rotation.z = eased * Math.PI * 0.1;
      } else if (animationPhase.current === 3) {
        segment2Ref.current.rotation.z = Math.PI * 0.1;
      } else if (animationPhase.current === 4) {
        segment2Ref.current.rotation.z = (1 - eased) * Math.PI * 0.1;
      } else if (animationPhase.current === 5) {
        segment2Ref.current.rotation.z = 0;
      } else if (animationPhase.current === 6) {
        segment2Ref.current.rotation.z = eased * Math.PI * 0.1;
      } else if (animationPhase.current === 7) {
        segment2Ref.current.rotation.z = Math.PI * 0.1;
      } else if (animationPhase.current === 8) {
        segment2Ref.current.rotation.z = (1 - eased) * Math.PI * 0.1;
      } else if (animationPhase.current === 9) {
        segment2Ref.current.rotation.z = 0;
      }
    }

    // Gripper
    if (gripperRef.current) {
      if (animationPhase.current === 3) {
        gripperRef.current.scale.x = 1 - eased * 0.5;
      } else if (animationPhase.current >= 4 && animationPhase.current <= 6) {
        gripperRef.current.scale.x = 0.5;
      } else if (animationPhase.current === 7) {
        gripperRef.current.scale.x = 0.5 + eased * 0.5;
      } else {
        gripperRef.current.scale.x = 1;
      }
    }

    // Cube position
    if (cubeRef.current && groupRef.current) {
      const currentPos = objectOnRight.current ? rightPos : leftPos;
      const targetPos = objectOnRight.current ? leftPos : rightPos;

      if (animationPhase.current <= 2) {
        cubeRef.current.position.set(...currentPos);
      } else if (animationPhase.current >= 3 && animationPhase.current <= 7) {
        const gripperWorldPos = new THREE.Vector3();
        gripperRef.current?.getWorldPosition(gripperWorldPos);
        const groupWorldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(groupWorldPos);

        // Calculate offset based on gripper orientation
        const gripperQuaternion = new THREE.Quaternion();
        gripperRef.current.getWorldQuaternion(gripperQuaternion);

        // Offset to place object at the tip of the fingers
        // Fingers are 1 unit long, centered at 0. So tip is at +/- 0.5.
        // Assuming we want it slightly below the center.
        const offset = new THREE.Vector3(0, -0.15, 0);
        offset.applyQuaternion(gripperQuaternion);

        cubeRef.current.position.copy(gripperWorldPos.sub(groupWorldPos).add(offset));
      } else if (animationPhase.current >= 8) {
        // Place it exactly on the target position
        // Note: We might want to capture the position at end of phase 7 to avoid snap
        // But for now, let's assume the arm reached the target.
        // To avoid X-snap, we should probably use the position where it landed.
        // However, for the loop to work, it needs to be at targetPos for the next pickup.
        // Let's trust the arm reached close enough.
        cubeRef.current.position.set(...targetPos);
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inRange && e.key.toLowerCase() === 'r') {
        if (onOpenBlog) onOpenBlog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inRange, onOpenBlog]);

  return (
    <group ref={groupRef} position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2, 1, 16]} />
        <meshStandardMaterial
          color="#888888"
          emissive="#888888"
          emissiveIntensity={0.001}
          roughness={0.9}
        />
      </mesh>

      {/* Rotating base */}
      <group ref={baseRef} position={[0, 1, 0]}>
        {/* First segment (shoulder) */}
        <group ref={segment1Ref} position={[0, 1, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.8, 3, 0.8]} />
            <meshStandardMaterial
              color="#aaaaaa"
              emissive="#aaaaaa"
              emissiveIntensity={0.001}
              roughness={0.9}
            />
          </mesh>

          {/* Second segment (elbow) */}
          <group ref={segment2Ref} position={[0, 3, 0]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.6, 3, 0.6]} />
              <meshStandardMaterial
                color="#bbbbbb"
                emissive="#bbbbbb"
                emissiveIntensity={0.001}
                roughness={0.9}
              />
            </mesh>

            {/* Gripper */}
            <group ref={gripperRef} position={[0, 3, 0]}>
              {/* Left finger */}
              <mesh position={[-0.5, 0, 0]}>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial
                  color="#cccccc"
                  emissive="#cccccc"
                  emissiveIntensity={0.002}
                  roughness={0.9}
                />
              </mesh>
              {/* Right finger */}
              <mesh position={[0.5, 0, 0]}>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial
                  color="#cccccc"
                  emissive="#cccccc"
                  emissiveIntensity={0.002}
                  roughness={0.9}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Object to pick up */}
      <mesh ref={cubeRef} position={[5, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Lights for both pickup positions */}
      <pointLight position={[5, 3, 0]} intensity={100} distance={12} color="#cccccc" decay={2} />
      <pointLight position={[-5, 3, 0]} intensity={100} distance={12} color="#cccccc" decay={2} />

      {/* Main light on robot */}
      <pointLight position={[0, 8, 0]} intensity={500} distance={25} color="#cccccc" decay={2} />

      {/* Interaction Prompt */}
      {inRange && (
        <Html position={[0, 8, 0]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>RoboArm Control</p>
            <p style={{ margin: 0, fontSize: '0.8em', opacity: 0.8 }}>Press R to Open Blog</p>
          </div>
        </Html>
      )}
    </group>
  );
};

export default RobotArm;