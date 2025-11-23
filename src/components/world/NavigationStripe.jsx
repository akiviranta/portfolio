
import React, { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import FloatingText from './FloatingText';
import '../../materials/PulseMaterial'; // Ensure the extend is run

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

    const textRef = useRef();

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.time += delta;
        }

        // Animate text position
        if (textRef.current) {
            // Calculate pulse position (0 to 1)
            // Same logic as shader: mod((time + offset) * speed, 1.0)
            const time = state.clock.getElapsedTime(); // Or accumulate delta manually if needed, but clock is easier.
            // Wait, materialRef.current.time is accumulated delta. Let's use that to be consistent.
            const t = materialRef.current ? materialRef.current.time : 0;

            const pulsePos = (t + pulseOffset) * pulseSpeed % 1.0;

            // Map 0..1 to -length/2 .. length/2
            // x position is along the length (which is X axis of the plane geometry before rotation?)
            // PlaneGeometry(length, width). Default is centered at 0.
            // So X goes from -length/2 to length/2.

            textRef.current.position.x = (pulsePos - 0.5) * length;
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

                {/* The Label (Embedded in the pulse) */}
                {label && (
                    <FloatingText
                        ref={textRef}
                        text={label}
                        position={[0, 0.1, 0]} // Start center, moved by ref
                        // The mesh is rotated -PI/2 on X. So its local Z is World Y (Up).
                        // Its local Y is World -Z.
                        // Its local X is along the length.
                        // We want text to stand up.
                        // If we put text flat on the plane, it's rotation [0,0,0].
                        // To stand up, we need to rotate around X?
                        // Let's try default rotation first (which is flat on ground in FloatingText, i.e. -PI/2 on X).
                        // But here we are inside a mesh that is ALREADY rotated -PI/2 on X.
                        // So if we want it flat on the stripe, we use rotation [0,0,0].
                        // If we want it standing up facing the camera... that's harder because the stripe is rotated.
                        // Let's keep it flat on the stripe for now, "embedded in the light".
                        rotation={[0, 0, 0]}
                        size={1.5}
                        color="black" // Black text on white pulse? Or white text?
                        // If pulse is white, white text is invisible.
                        // Let's try black text.
                        anchorX="center"
                        anchorY="middle"
                    />
                )}
            </mesh>

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
