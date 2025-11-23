import React, { useEffect, useRef, useState } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const SPEED = 5;

const Player = () => {
    const { camera } = useThree();
    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: 'Dynamic',
        position: [0, 5, 0],
        args: [1],
        fixedRotation: true,
    }));

    const velocity = useRef([0, 0, 0]);
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

    const keys = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });

    const [locked, setLocked] = useState(false);
    const controlsRef = useRef();

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.code) {
                case 'KeyW': keys.current.forward = true; break;
                case 'KeyS': keys.current.backward = true; break;
                case 'KeyA': keys.current.left = true; break;
                case 'KeyD': keys.current.right = true; break;
            }
        };
        const handleKeyUp = (e) => {
            switch (e.code) {
                case 'KeyW': keys.current.forward = false; break;
                case 'KeyS': keys.current.backward = false; break;
                case 'KeyA': keys.current.left = false; break;
                case 'KeyD': keys.current.right = false; break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame(() => {
        if (!ref.current) return;

        // Sync camera to player
        camera.position.copy(ref.current.position);
        camera.position.y += 1;

        const frontVector = new THREE.Vector3(
            0,
            0,
            Number(keys.current.backward) - Number(keys.current.forward)
        );
        const sideVector = new THREE.Vector3(
            Number(keys.current.left) - Number(keys.current.right),
            0,
            0
        );

        const direction = new THREE.Vector3();
        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyEuler(camera.rotation);

        // Flatten direction to XZ plane to prevent flying/digging
        // But we need to re-normalize if we want constant speed?
        // Actually, applyEuler(camera.rotation) makes it follow look direction.
        // If looking down, direction has negative Y.
        // We want to move on the ground.

        // Better approach: Get camera's forward vector projected on XZ.
        // But applyEuler is easy. Let's just zero out Y and re-normalize if length > 0.

        // However, if we just zero Y, speed decreases when looking down.
        // Standard FPS movement:
        // Forward = Camera Forward projected on XZ.
        // Right = Camera Right projected on XZ.

        // Let's try the simple fix first:
        // direction.y = 0; 
        // But wait, api.velocity.set overrides gravity if we set Y to 0?
        // No, we should preserve current Y velocity (gravity).

        api.velocity.set(direction.x, velocity.current[1], direction.z);
    });

    return (
        <>
            <PointerLockControls
                ref={controlsRef}
                onLock={() => setLocked(true)}
                onUnlock={() => setLocked(false)}
            />
            <mesh ref={ref}>
                <sphereGeometry args={[1]} />
                <meshStandardMaterial color="orange" transparent opacity={0} />
            </mesh>

            {!locked && (
                <Html center>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '20px',
                        borderRadius: '10px',
                        color: 'white'
                    }}>
                        <h1>Click to Start</h1>
                        <p>WASD to Move, Mouse to Look</p>
                        <button
                            onClick={() => controlsRef.current.lock()}
                            style={{
                                marginTop: '10px',
                                padding: '10px 20px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Enter World
                        </button>
                    </div>
                </Html>
            )}
        </>
    );
};

export default Player;
