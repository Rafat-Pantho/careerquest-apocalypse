import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    Stars,
    Float,
    Icosahedron,
    Torus,
    MeshDistortMaterial,
    PerspectiveCamera,
    Environment,
    Sparkles
} from '@react-three/drei';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// Floating Artifact (Core of the Scene)
// -----------------------------------------------------------------------------
const MysticalArtifact = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Slow rotation
        meshRef.current.rotation.x = Math.cos(t / 4) / 2;
        meshRef.current.rotation.y = Math.sin(t / 4) / 2;
        meshRef.current.rotation.z = Math.sin(t / 1.5) / 2;
        // Bobbing motion handled by Float parent

        // Pulse scale slightly
        const scale = 1 + Math.sin(t * 2) * 0.05;
        meshRef.current.scale.set(scale, scale, scale);
    });

    return (
        <group>
            {/* Central Crystal Core */}
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <Icosahedron args={[1, 1]} position={[0, 0, 0]} ref={meshRef}>
                    <MeshDistortMaterial
                        color="#fbbf24" // Gold
                        emissive="#d97706"
                        emissiveIntensity={0.5}
                        roughness={0.1}
                        metalness={0.8}
                        distort={0.4} // Wobbly liquid-like surface
                        speed={2}
                    />
                </Icosahedron>
            </Float>

            {/* Orbiting Ring 1 (Magic Circle) */}
            <Float speed={4} rotationIntensity={2} floatIntensity={1}>
                <Torus args={[2.2, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial
                        color="#a855f7" // Purple/Mana
                        emissive="#9333ea"
                        emissiveIntensity={2}
                        toneMapped={false}
                    />
                </Torus>
            </Float>

            {/* Orbiting Ring 2 (Cross Axis) */}
            <Float speed={3} rotationIntensity={2} floatIntensity={1.5}>
                <Torus args={[1.8, 0.03, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
                    <meshStandardMaterial
                        color="#3b82f6" // Blue/Arcane
                        emissive="#2563eb"
                        emissiveIntensity={2}
                        toneMapped={false}
                    />
                </Torus>
            </Float>
        </group>
    );
};

// -----------------------------------------------------------------------------
// Floating Debris / Ruins
// -----------------------------------------------------------------------------
const FloatingRocks = () => {
    const rocks = useMemo(() => {
        return new Array(15).fill().map(() => ({
            position: [
                (Math.random() - 0.5) * 15, // Spread wide
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10 - 2 // Behind slightly
            ],
            scale: 0.2 + Math.random() * 0.5,
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
        }));
    }, []);

    return (
        <group>
            {rocks.map((rock, i) => (
                <Float key={i} speed={1 + Math.random()} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={rock.position} rotation={rock.rotation} scale={rock.scale}>
                        <dodecahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial
                            color="#4b5563" // Stone grey
                            roughness={0.8}
                            metalness={0.2}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

// -----------------------------------------------------------------------------
// Main Scene Component
// -----------------------------------------------------------------------------
const Landing3DScene = () => {
    return (
        <div className="absolute inset-0 z-0 h-full w-full">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                {/* Cinematic Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
                <spotLight
                    position={[0, 10, 0]}
                    angle={0.5}
                    penumbra={1}
                    intensity={2}
                    color="#a855f7"
                    castShadow
                />

                {/* Environment */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <fog attach="fog" args={['#1a1a2e', 5, 20]} />

                {/* Objects */}
                <MysticalArtifact />
                <FloatingRocks />

                {/* Effects */}
                <Sparkles
                    count={100}
                    scale={12}
                    size={4}
                    speed={0.4}
                    opacity={0.5}
                    color="#fbbf24"
                />

                {/* Interaction */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>

            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-dungeon-950/90 via-dungeon-950/70 to-transparent pointer-events-none" />
        </div>
    );
};

export default Landing3DScene;
