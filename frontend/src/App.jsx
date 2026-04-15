import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import Marketplace from './pages/Marketplace';
import Recruiters from './pages/Recruiters';
import Network from './pages/Network';
import Profile from './pages/Profile';
import WeirdPortal from './components/WeirdPortal';
import { useWeirdMode } from './context/WeirdModeContext';

function App() {
    const [loading, setLoading] = useState(true);
    const { isWeirdMode, isTransitioning } = useWeirdMode();

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h1 className="text-white font-serif text-xl tracking-widest animate-pulse">CAREER QUEST</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Router>
                <WeirdPortal />
                <div className="transition-all duration-1000">
                    <motion.div
                        animate={isTransitioning ? { scale: 0, rotate: 720, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ duration: 1.5, ease: [.7, 0, .3, 1] }}
                        className="origin-center"
                    >
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/student-dashboard" element={<StudentDashboard />} />
                            <Route path="/marketplace" element={<Marketplace />} />
                            <Route path="/recruiters" element={<Recruiters />} />
                            <Route path="/network" element={<Network />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </motion.div>
                </div>
            </Router>
        </div>
    );
}

export default App;