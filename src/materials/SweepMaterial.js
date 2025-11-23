import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const SweepMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 0.0, 0.0),
    pulseColor: new THREE.Color(1.0, 1.0, 1.0),
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
    uniform float pulseSpeed;
    uniform float pulseWidth;
    varying vec2 vUv;

    #define PI 3.14159265359

    void main() {
      // Center UVs to -0.5 to 0.5
      vec2 centered = vUv - 0.5;
      
      // Calculate angle (-PI to PI)
      float angle = atan(centered.y, centered.x);
      
      // Normalize angle to 0 to 1
      float normalizedAngle = (angle + PI) / (2.0 * PI);
      
      // Calculate pulse position based on time
      // We want it to rotate.
      float pulsePos = mod(time * pulseSpeed, 1.0);
      
      // Distance in angular space
      float dist = abs(normalizedAngle - pulsePos);
      
      // Handle wrap-around (e.g. 0.99 and 0.01 are close)
      if (dist > 0.5) dist = 1.0 - dist;
      
      // Create smooth pulse
      float pulse = smoothstep(pulseWidth, 0.0, dist);
      
      // Ring Mask
      // centered is -0.5 to 0.5. Length is 0 to ~0.7.
      // We want the ring at the edge (radius 0.5).
      float r = length(centered) * 2.0; // 0 to 1 (at edge)
      float ringMask = smoothstep(0.8, 0.9, r); // Only show outer 10-20%
      
      vec3 finalColor = mix(color, pulseColor, pulse * ringMask);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ SweepMaterial });

export default SweepMaterial;
