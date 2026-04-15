import React, { createContext, useState, useContext, useEffect } from 'react';

const WeirdModeContext = createContext();

export const WeirdModeProvider = ({ children }) => {
    const [isWeirdMode, setIsWeirdMode] = useState(() => {
        // Persist state
        return localStorage.getItem('weirdMode') === 'true';
    });
    const [isTransitioning, setIsTransitioning] = useState(false);

    const toggleWeirdMode = () => {
        setIsTransitioning(true);

        // Wait for "Transition" midpoint to switch themes
        setTimeout(() => {
            setIsWeirdMode(prev => {
                const newState = !prev;
                localStorage.setItem('weirdMode', newState);
                return newState;
            });
        }, 1500);

        // End transition after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
        }, 3000);
    };

    return (
        <WeirdModeContext.Provider value={{ isWeirdMode, toggleWeirdMode, isTransitioning }}>
            {children}
        </WeirdModeContext.Provider>
    );
};

export const useWeirdMode = () => useContext(WeirdModeContext);