import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const PulseMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 0.0, 0.0), // Black base
    pulseColor: new THREE.Color(1.0, 1.0, 1.0), // White pulse
    length: 1.0,
    pulseSpeed: 1.0,
    pulseWidth: 0.1,
    offset: 0.0, // Default offset
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
    uniform float offset; // New uniform
    uniform vec3 color;
    uniform vec3 pulseColor;
    uniform float length;
    uniform float pulseSpeed;
    uniform float pulseWidth;
    varying vec2 vUv;

    void main() {
      // Calculate pulse position (0 to 1 along the stripe)
      float pulsePos = mod((time + offset) * pulseSpeed, 1.0);
      
      // Distance from current pixel (vUv.x) to pulse position
      // Assuming the stripe is mapped along U (x-axis)
      float dist = abs(vUv.x - pulsePos);
      
      // Create a smooth pulse
      float pulse = smoothstep(pulseWidth, 0.0, dist);
      
      // Mix base color with pulse color
      vec3 finalColor = mix(color, pulseColor, pulse * 0.5); // 0.5 intensity for "faint"
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ PulseMaterial });

export default PulseMaterial;
