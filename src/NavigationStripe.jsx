
import React, { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import FloatingText from './FloatingText';
import './PulseMaterial'; // Ensure the extend is run

const NavigationStripe = ({
    start = [0, 0, 0],
    end = [10, 0, 0],
    width = 2,
    label = "",
    pulseSpeed = 0.5,
    pulseOffset = 0.0, // New prop
    children
}) => {
    const materialRef = useRef();

    // Calculate geometry based on start/end points
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();

    // Midpoint for position
    const position = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

    // Rotation to align with direction
    // Default plane is XY, we want it flat on XZ?
    // PlaneGeometry is XY. We rotate -PI/2 on X to make it XZ.
    // Then we rotate around Y to point to target.
    const angle = Math.atan2(direction.z, direction.x);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.time += delta;
        }
    });

    return (
        <group>
            {/* The Stripe */}
            <mesh
                position={position}
                rotation={[-Math.PI / 2, 0, -angle]} // -angle because of coordinate system? Test this.
            >
                <planeGeometry args={[length, width]} />
                <pulseMaterial
                    ref={materialRef}
                    length={length}
                    pulseSpeed={pulseSpeed}
                    pulseWidth={0.2} // Adjust for sharpness
                    offset={pulseOffset}
                />
            </mesh>

            {/* The Label (at the start) */}
            {label && (
                <FloatingText
                    text={label}
                    position={[start[0], 0.1, start[2]]} // Slightly above ground
                    rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]} // Rotate to face the "road"? Or just flat?
                    // Let's put it flat, readable from above-ish.
                    // Maybe perpendicular to the path?
                    size={1.5}
                    color="white"
                    anchorX="center"
                    anchorY="bottom" // Text sits "on top" of the start point
                />
            )}

            {/* Content at the end of the path */}
            {children && (
                <group position={end}>
                    {children}
                </group>
            )}
        </group>
    );
};

export default NavigationStripe;
