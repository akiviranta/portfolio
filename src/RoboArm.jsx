import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// SO-101 Robot Arm Component
const RobotArm = ({ position = [20, 0, 20] }) => {
  const baseRef = useRef();
  const segment1Ref = useRef();
  const segment2Ref = useRef();
  const gripperRef = useRef();
  const cubeRef = useRef();
  const groupRef = useRef();

  const [animationPhase, setAnimationPhase] = useState(0);
  const phaseTime = useRef(0);

  useFrame((state, delta) => {
    phaseTime.current += delta;

    // Animation cycle: 0=idle, 1=reach, 2=grab, 3=lift, 4=return, 5=release
    const phaseDurations = [1, 1.5, 0.5, 1.5, 1.5, 0.5];
    
    if (phaseTime.current > phaseDurations[animationPhase]) {
      phaseTime.current = 0;
      setAnimationPhase((prev) => (prev + 1) % 6);
    }

    const t = phaseTime.current / phaseDurations[animationPhase];
    const eased = Math.sin(t * Math.PI * 0.5); // Smooth easing

    // Base rotation
    if (baseRef.current) {
      if (animationPhase === 1) {
        // Rotate towards object
        baseRef.current.rotation.y = eased * Math.PI * 0.3;
      } else if (animationPhase === 4) {
        // Rotate back
        baseRef.current.rotation.y = (1 - eased) * Math.PI * 0.3;
      }
    }

    // First segment (shoulder)
    if (segment1Ref.current) {
      if (animationPhase === 1) {
        // Reach down
        segment1Ref.current.rotation.z = eased * Math.PI * 0.4;
      } else if (animationPhase === 3) {
        // Lift up
        segment1Ref.current.rotation.z = (1 - eased) * Math.PI * 0.4;
      }
    }

    // Second segment (elbow)
    if (segment2Ref.current) {
      if (animationPhase === 1) {
        // Extend
        segment2Ref.current.rotation.z = -eased * Math.PI * 0.3;
      } else if (animationPhase === 3) {
        // Retract
        segment2Ref.current.rotation.z = -(1 - eased) * Math.PI * 0.3;
      }
    }

    // Gripper
    if (gripperRef.current) {
      if (animationPhase === 2) {
        // Close gripper
        gripperRef.current.scale.x = 1 - eased * 0.5;
      } else if (animationPhase === 5) {
        // Open gripper
        gripperRef.current.scale.x = 0.5 + eased * 0.5;
      }
    }

    // Cube being picked up
    if (cubeRef.current) {
      if (animationPhase >= 2 && animationPhase <= 4) {
        // Attach to gripper
        const gripperWorldPos = new THREE.Vector3();
        gripperRef.current?.getWorldPosition(gripperWorldPos);
        cubeRef.current.position.copy(gripperWorldPos);
        cubeRef.current.position.y -= 1;
      } else if (animationPhase === 5) {
        // Release and fall
        cubeRef.current.position.y = 0.5 + (1 - eased) * 4;
      } else if (animationPhase === 0) {
        // Reset position
        cubeRef.current.position.set(position[0] + 5, 0.5, position[2] + 5);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2, 1, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rotating base */}
      <group ref={baseRef} position={[0, 1, 0]}>
        {/* First segment (shoulder) */}
        <group ref={segment1Ref} position={[0, 1, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.8, 3, 0.8]} />
            <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Second segment (elbow) */}
          <group ref={segment2Ref} position={[0, 3, 0]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.6, 3, 0.6]} />
              <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Gripper */}
            <group ref={gripperRef} position={[0, 3, 0]}>
              {/* Left finger */}
              <mesh position={[-0.5, 0, 0]}>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
              </mesh>
              {/* Right finger */}
              <mesh position={[0.5, 0, 0]}>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Object to pick up */}
      <mesh ref={cubeRef} position={[5, 0.5, 5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.2} />
      </mesh>

      {/* Light on robot */}
      <pointLight position={[0, 5, 0]} intensity={50} distance={15} color="#00ff88" />
    </group>
  );
};

export default RobotArm;