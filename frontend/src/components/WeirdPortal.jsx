import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeirdMode } from '../context/WeirdModeContext';

const WeirdPortal = () => {
    const { isTransitioning } = useWeirdMode();
    const canvasRef = useRef(null);
    const imagesRef = useRef([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const totalFrames = 76;

    // Preload images on mount
    useEffect(() => {
        let isMounted = true;
        const loadImages = async () => {
            const promises = [];
            const loadedImages = [];

            for (let i = 1; i <= totalFrames; i++) {
                const img = new Image();
                const padded = i.toString().padStart(3, '0');
                img.src = `/transition-animation/ezgif-frame-${padded}.jpg`;
                promises.push(new Promise((resolve) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                }));
                loadedImages.push(img);
            }

            await Promise.all(promises);

            if (isMounted) {
                imagesRef.current = loadedImages;
                setImagesLoaded(true);
            }
        };

        loadImages();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isTransitioning || !imagesLoaded || !canvasRef.current || imagesRef.current.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let startTime = null;

        // Set canvas size
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        const drawFrame = (img) => {
            if (!img || !img.width) return;
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };

        const render = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const duration = 3000;

            // Calculate current frame based on progress
            const progress = Math.min(elapsed / duration, 1);
            const frameIndex = Math.floor(progress * (totalFrames - 1));
            const safeIndex = Math.max(0, Math.min(frameIndex, totalFrames - 1));

            const img = imagesRef.current[safeIndex];
            if (img) {
                drawFrame(img);
            }

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', setCanvasSize);
        };
    }, [isTransitioning, imagesLoaded]);

    return (
        <AnimatePresence>
            {isTransitioning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
                >
                    {/* High-Performance Canvas Layer */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full z-20"
                    />

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 z-50 tracking-widest uppercase text-center drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    >
                        Entering The Void...
                    </motion.h1>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default WeirdPortal;