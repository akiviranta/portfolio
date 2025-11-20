import React, { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import FloatingText from './FloatingText';

// Custom Shader Material
const PulseMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color(0.0, 0.0, 0.0), // Black base
        pulseColor: new THREE.Color(1.0, 1.0, 1.0), // White pulse
        length: 1.0,
        pulseSpeed: 1.0,
        pulseWidth: 0.1,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    uniform vec3 pulseColor;
    uniform float length;
    uniform float pulseSpeed;
    uniform float pulseWidth;
    varying vec2 vUv;

    void main() {
      // Calculate pulse position (0 to 1 along the stripe)
      float pulsePos = mod(time * pulseSpeed, 1.0);
      
      // Distance from current pixel (vUv.x) to pulse position
      // Assuming the stripe is mapped along U (x-axis)
      float dist = abs(vUv.x - pulsePos);
      
      // Create a smooth pulse
      float pulse = smoothstep(pulseWidth, 0.0, dist);
      
      // Add a second pulse for better flow? Maybe just one for now.
      
      // Mix base color with pulse color
      vec3 finalColor = mix(color, pulseColor, pulse * 0.5); // 0.5 intensity for "faint"
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ PulseMaterial });

const NavigationStripe = ({
    start = [0, 0, 0],
    end = [10, 0, 0],
    width = 2,
    label = "",
    pulseSpeed = 0.5
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
        </group>
    );
};

export default NavigationStripe;
