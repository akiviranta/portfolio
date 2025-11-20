import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import * as THREE from 'three';

// Configuration
const CONFIG = {
    ball: {
        radius: 2,
        color: '#cccccc',
        emissiveIntensity: 0.001,
        roughness: 0.9,
        lightIntensity: 200,
        lightDistanceMultiplier: 4,
        speed: 20,
        rollSpeedMultiplier: 0.01,
    },
    trail: {
        maxPoints: 10,
        spacing: 2,
        fadeTime: 3000,
        lightIntensity: 100,
        markerSizeRatio: 0.5,
        emissiveMultiplier: 0.5,
    },
    camera: {
        offset: [0, 20, 50],
        lerpSpeed: 0.1,
    },
};

const Ball = () => {
    const [physicsRef, api] = useSphere(() => ({
        mass: 1,
        args: [CONFIG.ball.radius],
        position: [0, 2, 0],
    }));

    const visualRef = useRef();
    const positionRef = useRef([0, 2, 0]);
    const lastTrailPos = useRef([0, 2, 0]);
    const [trailPoints, setTrailPoints] = useState([]);
    const keys = useRef({ w: false, a: false, s: false, d: false });
    const { camera } = useThree();

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
        };

        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const unsubscribe = api.position.subscribe((p) => {
            positionRef.current = p;
        });
        return unsubscribe;
    }, [api]);

    useFrame(() => {
        let vx = 0;
        let vz = 0;

        if (keys.current.w) vz -= CONFIG.ball.speed;
        if (keys.current.s) vz += CONFIG.ball.speed;
        if (keys.current.a) vx -= CONFIG.ball.speed;
        if (keys.current.d) vx += CONFIG.ball.speed;

        api.velocity.set(vx, 0, vz);

        // Update visual position and rotation
        if (visualRef.current) {
            visualRef.current.position.set(...positionRef.current);

            const velocityMagnitude = Math.sqrt(vx * vx + vz * vz);
            if (velocityMagnitude > 0) {
                const rollSpeed = velocityMagnitude * CONFIG.ball.rollSpeedMultiplier;
                visualRef.current.rotateOnAxis(new THREE.Vector3(-vz, 0, vx).normalize(), rollSpeed);
            }

            // Update trail points
            const dx = positionRef.current[0] - lastTrailPos.current[0];
            const dz = positionRef.current[2] - lastTrailPos.current[2];
            const distanceTraveled = Math.sqrt(dx * dx + dz * dz);
            const now = Date.now();

            setTrailPoints((prev) => {
                let updatedTrail = prev.filter(
                    (point) => now - point.createdAt < CONFIG.trail.fadeTime
                );

                if (distanceTraveled >= CONFIG.trail.spacing) {
                    updatedTrail = [
                        ...updatedTrail,
                        {
                            position: [...positionRef.current],
                            createdAt: now,
                        },
                    ];

                    if (updatedTrail.length > CONFIG.trail.maxPoints) {
                        updatedTrail.shift();
                    }

                    lastTrailPos.current = [...positionRef.current];
                }

                return updatedTrail;
            });

            // Update camera to follow ball
            camera.position.lerp(
                new THREE.Vector3(
                    positionRef.current[0] + CONFIG.camera.offset[0],
                    positionRef.current[1] + CONFIG.camera.offset[1],
                    positionRef.current[2] + CONFIG.camera.offset[2]
                ),
                CONFIG.camera.lerpSpeed
            );
            camera.lookAt(positionRef.current[0], positionRef.current[1], positionRef.current[2]);
        }
    });

    const now = Date.now();

    return (
        <>
            <group ref={visualRef}>
                <pointLight
                    intensity={CONFIG.ball.lightIntensity}
                    distance={CONFIG.ball.radius * CONFIG.ball.lightDistanceMultiplier}
                    color={CONFIG.ball.color}
                    decay={2}
                />
                <mesh>
                    <sphereGeometry args={[CONFIG.ball.radius, 32, 32]} />
                    <meshStandardMaterial
                        color={CONFIG.ball.color}
                        emissive={CONFIG.ball.color}
                        emissiveIntensity={CONFIG.ball.emissiveIntensity}
                        roughness={CONFIG.ball.roughness}
                    />
                </mesh>
                <mesh ref={physicsRef} visible={false}>
                    <sphereGeometry args={[CONFIG.ball.radius]} />
                </mesh>
            </group>

            {/* Trail markers */}
            {trailPoints.map((point, index) => {
                const age = now - point.createdAt;
                const fadeProgress = age / CONFIG.trail.fadeTime;
                const opacity = 1 - fadeProgress;
                const emissiveIntensity = opacity * CONFIG.trail.emissiveMultiplier;
                const lightIntensity = CONFIG.trail.lightIntensity * opacity;

                return (
                    <group key={`${point.createdAt}-${index}`} position={point.position}>
                        <pointLight
                            intensity={lightIntensity}
                            distance={CONFIG.ball.radius * CONFIG.ball.lightDistanceMultiplier}
                            color={CONFIG.ball.color}
                            decay={2}
                        />
                        <mesh>
                            <sphereGeometry args={[CONFIG.ball.radius * CONFIG.trail.markerSizeRatio, 16, 16]} />
                            <meshStandardMaterial
                                color={CONFIG.ball.color}
                                emissive={CONFIG.ball.color}
                                emissiveIntensity={emissiveIntensity}
                                transparent={true}
                                opacity={opacity}
                            />
                        </mesh>
                    </group>
                );
            })}
        </>
    );
};

export default Ball;
