import React, { useState, useEffect } from 'react';
import { useWeirdMode } from '../context/WeirdModeContext';

const FrameAnimation = () => {
    const { isWeirdMode } = useWeirdMode();
    const [currentFrame, setCurrentFrame] = useState(1);

    // Configuration based on mode
    const totalFrames = isWeirdMode ? 76 : 127;
    const duration = isWeirdMode ? 3000 : 5000;
    const frameDuration = Math.round(duration / totalFrames);
    const folder = isWeirdMode ? 'transition-animation' : 'ui-animation';

    useEffect(() => {
        // Reset frame when mode changes to prevent out-of-bounds error
        setCurrentFrame(1);
    }, [isWeirdMode]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
        }, frameDuration);

        return () => clearInterval(interval);
    }, [totalFrames, frameDuration]);

    const frameNum = currentFrame.toString().padStart(3, '0');

    return (
        <div className="w-full h-full relative overflow-hidden bg-navy-950">
            <img
                src={`/${folder}/ezgif-frame-${frameNum}.jpg`}
                alt="Career Quest Animation"
                className="w-full h-full object-cover"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default FrameAnimation;