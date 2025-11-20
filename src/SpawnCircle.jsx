import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import FloatingText from './FloatingText';
import './SweepMaterial'; // Ensure material is registered

const SpawnCircle = ({ radius = 10, color = '#000000', pulseColor = '#ffffff' }) => {
    const materialRef = useRef();

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.time += delta;
        }
    });

    return (
        <group>
            {/* The Circle Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <circleGeometry args={[radius, 64]} />
                {/* Reusing the pulse material but mapping it radially? 
            The PulseMaterial uses vUv.x for the pulse. 
            For a circle, UVs are typically mapped such that center is (0.5, 0.5).
            We might need a radial pulse shader or just use the existing one and accept it looks like a sweep.
            Let's try the existing one first. It might look like a linear sweep across the circle.
            Actually, for a "hub", a radial pulse (ripples) would be cooler.
            But to save time/complexity, let's stick to the requested "emit light just like the stripes".
            If we want it to look like the stripes, maybe we just use a standard material with a glow or the same pulse.
        */}
                <sweepMaterial
                    ref={materialRef}
                    color={new THREE.Color(color)}
                    pulseColor={new THREE.Color(pulseColor)}
                    pulseSpeed={0.5}
                    pulseWidth={0.05} // Sharp sweep
                />
            </mesh>

            {/* Name Text */}
            <FloatingText
                text="Arttu Kiviranta"
                position={[0, 2, 0]} // Floating above the circle
                size={3}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            />
        </group>
    );
};

import * as THREE from 'three';

export default SpawnCircle;
