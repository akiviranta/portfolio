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
  const [objectOnRight, setObjectOnRight] = useState(true);
  const phaseTime = useRef(0);

  // Object positions
  const rightPos = [5, 0.5, 0];
  const leftPos = [-5, 0.5, 0];

  useFrame((state, delta) => {
    phaseTime.current += delta;

    // Animation cycle: 0=idle, 1=rotate to pickup, 2=reach down, 3=grab, 4=lift, 5=rotate to place, 6=lower, 7=release
    const phaseDurations = [0.5, 1, 1, 0.3, 1, 1.5, 1, 0.3];

    if (phaseTime.current > phaseDurations[animationPhase]) {
      phaseTime.current = 0;
      if (animationPhase === 7) {
        setObjectOnRight((prev) => !prev);
        setAnimationPhase(0);
      } else {
        setAnimationPhase((prev) => prev + 1);
      }
    }

    const t = phaseTime.current / phaseDurations[animationPhase];
    const eased = Math.sin(t * Math.PI * 0.5);

    const pickupAngle = objectOnRight ? Math.PI * 0.4 : -Math.PI * 0.4;
    const placeAngle = objectOnRight ? -Math.PI * 0.4 : Math.PI * 0.4;

    // Base rotation
    if (baseRef.current) {
      if (animationPhase === 0) {
        baseRef.current.rotation.y = 0;
      } else if (animationPhase === 1) {
        baseRef.current.rotation.y = eased * pickupAngle;
      } else if (animationPhase >= 2 && animationPhase <= 3) {
        baseRef.current.rotation.y = pickupAngle;
      } else if (animationPhase === 4) {
        baseRef.current.rotation.y = pickupAngle;
      } else if (animationPhase === 5) {
        baseRef.current.rotation.y = pickupAngle + eased * (placeAngle - pickupAngle);
      } else if (animationPhase >= 6) {
        baseRef.current.rotation.y = placeAngle;
      }
    }

    // First segment (shoulder)
    if (segment1Ref.current) {
      if (animationPhase === 0 || animationPhase === 1) {
        segment1Ref.current.rotation.z = 0;
      } else if (animationPhase === 2) {
        segment1Ref.current.rotation.z = eased * Math.PI * 0.35;
      } else if (animationPhase === 3) {
        segment1Ref.current.rotation.z = Math.PI * 0.35;
      } else if (animationPhase === 4) {
        segment1Ref.current.rotation.z = (1 - eased) * Math.PI * 0.35;
      } else if (animationPhase === 5) {
        segment1Ref.current.rotation.z = 0;
      } else if (animationPhase === 6) {
        segment1Ref.current.rotation.z = eased * Math.PI * 0.35;
      } else if (animationPhase === 7) {
        segment1Ref.current.rotation.z = Math.PI * 0.35;
      }
    }

    // Second segment (elbow)
    if (segment2Ref.current) {
      if (animationPhase === 0 || animationPhase === 1) {
        segment2Ref.current.rotation.z = 0;
      } else if (animationPhase === 2) {
        segment2Ref.current.rotation.z = -eased * Math.PI * 0.25;
      } else if (animationPhase === 3) {
        segment2Ref.current.rotation.z = -Math.PI * 0.25;
      } else if (animationPhase === 4) {
        segment2Ref.current.rotation.z = -(1 - eased) * Math.PI * 0.25;
      } else if (animationPhase === 5) {
        segment2Ref.current.rotation.z = 0;
      } else if (animationPhase === 6) {
        segment2Ref.current.rotation.z = -eased * Math.PI * 0.25;
      } else if (animationPhase === 7) {
        segment2Ref.current.rotation.z = -Math.PI * 0.25;
      }
    }

    // Gripper
    if (gripperRef.current) {
      if (animationPhase === 3) {
        gripperRef.current.scale.x = 1 - eased * 0.5;
      } else if (animationPhase >= 4 && animationPhase <= 6) {
        gripperRef.current.scale.x = 0.5;
      } else if (animationPhase === 7) {
        gripperRef.current.scale.x = 0.5 + eased * 0.5;
      } else {
        gripperRef.current.scale.x = 1;
      }
    }

    // Cube position
    if (cubeRef.current && groupRef.current) {
      const currentPos = objectOnRight ? rightPos : leftPos;
      const targetPos = objectOnRight ? leftPos : rightPos;

      if (animationPhase <= 2) {
        cubeRef.current.position.set(...currentPos);
      } else if (animationPhase >= 3 && animationPhase <= 6) {
        const gripperWorldPos = new THREE.Vector3();
        gripperRef.current?.getWorldPosition(gripperWorldPos);
        const groupWorldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(groupWorldPos);
        cubeRef.current.position.copy(gripperWorldPos.sub(groupWorldPos));
        cubeRef.current.position.y -= 0.8;
      } else if (animationPhase === 7) {
        const dropY = 0.5 + (1 - eased) * 3;
        cubeRef.current.position.set(targetPos[0], dropY, targetPos[2]);
      }
    }
  });

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
    </group>
  );
};

export default RobotArm;