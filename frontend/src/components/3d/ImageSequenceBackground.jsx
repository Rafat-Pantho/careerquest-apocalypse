import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const FRAME_COUNT = 126;
const FPS = 30; // Adjust speed as needed
const PATH = '/frontpage/ezgif-frame-';
const EXT = '.jpg';

// Preload images for smoother playback
const preloadImages = () => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0');
        img.src = `${PATH}${num}${EXT}`;
    }
};

const ImageSequenceBackground = () => {
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Load all images into memory
    useEffect(() => {
        let loadedCount = 0;
        const imgArray = [];

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            const num = i.toString().padStart(3, '0');
            img.src = `${PATH}${num}${EXT}`;

            img.onload = () => {
                loadedCount++;
                if (loadedCount === FRAME_COUNT) {
                    setLoaded(true);
                }
            };
            imgArray.push(img);
        }
        setImages(imgArray);
    }, []);

    // Animation Loop
    useEffect(() => {
        if (!loaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let currentFrame = 0;
        let lastTime = 0;
        const interval = 1000 / FPS;

        const render = (time) => {
            const deltaTime = time - lastTime;

            if (deltaTime > interval) {
                // Draw current frame
                const img = images[currentFrame];

                // maintain aspect ratio to cover screen
                const renderRatio = Math.max(canvas.width / img.width, canvas.height / img.height);
                const renderW = img.width * renderRatio;
                const renderH = img.height * renderRatio;
                const x = (canvas.width - renderW) / 2;
                const y = (canvas.height - renderH) / 2;

                ctx.drawImage(img, x, y, renderW, renderH);

                // Next frame
                currentFrame = (currentFrame + 1) % FRAME_COUNT;
                lastTime = time;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [loaded, images]);

    // Handle Resize with DPI awareness
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                // Set actual backing store size
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;

                // Ensure context uses smooth scaling
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fade in when loaded
    useEffect(() => {
        if (loaded && canvasRef.current) {
            gsap.to(canvasRef.current, { opacity: 1, duration: 1.5 });
        }
    }, [loaded]);



    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover opacity-0" // Starts hidden
            />
            {/* 1. Cinematic Vignette (Focus center) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

            {/* 2. Color Grading (Teal/Blue Tint) */}
            <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay pointer-events-none" />

            {/* 3. Text Gradient (Bottom readability) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none" />

            {/* 4. Film Grain (Subtle) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        </div>
    );
};

export default ImageSequenceBackground;
