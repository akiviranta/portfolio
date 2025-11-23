import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const BlogPost = ({ position = [0, 0, 0], url = "https://example.com", title = "Read Paper" }) => {
    const [hovered, setHovered] = useState(false);
    const [inRange, setInRange] = useState(false);
    const groupRef = useRef();
    const { camera } = useThree();

    useFrame(() => {
        if (groupRef.current) {
            const dist = groupRef.current.position.distanceTo(camera.position);
            if (dist < 8) { // Activation range
                setInRange(true);
            } else {
                setInRange(false);
            }
        }
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (inRange && e.key.toLowerCase() === 'r') {
                window.open(url, '_blank');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inRange, url]);

    return (
        <group ref={groupRef} position={position}>
            {/* Floating Paper Icon */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                position={[0, 1, 0]}
            >
                <boxGeometry args={[1, 1.4, 0.1]} />
                <meshStandardMaterial color={hovered ? "gold" : "white"} />
            </mesh>

            {/* Interaction Prompt */}
            {inRange && (
                <Html position={[0, 2.5, 0]} center>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontFamily: 'sans-serif',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none', // Don't block clicks
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{title}</p>
                        <p style={{ margin: 0, fontSize: '0.8em', opacity: 0.8 }}>Press R to Read</p>
                    </div>
                </Html>
            )}
        </group>
    );
};

export default BlogPost;
