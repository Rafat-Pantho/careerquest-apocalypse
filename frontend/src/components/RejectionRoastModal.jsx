import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, AlertTriangle, Skull } from 'lucide-react';

const RejectionRoastModal = ({ isOpen, onClose, applicationId, applicationTitle }) => {
    const [roast, setRoast] = useState('');
    const [tier, setTier] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && applicationId) {
            fetchRoast();
        }
    }, [isOpen, applicationId]);

    const fetchRoast = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/roast', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ applicationId, applicationTitle })
            });
            const data = await res.json();
            setRoast(data.roast);
            setTier(data.tier);
        } catch (err) {
            console.error(err);
            setRoast("Even our AI is speechless at this failure. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tierColors = {
        1: "from-blue-500 to-cyan-500",
        2: "from-orange-500 to-red-500",
        3: "from-red-600 to-purple-700"
    };

    const tierIcons = {
        1: <AlertTriangle size={32} className="text-cyan-400" />,
        2: <Flame size={32} className="text-orange-500" />,
        3: <Skull size={32} className="text-red-500" />
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Header */}
                    <div className={`h-2 bg-gradient-to-r ${tierColors[tier] || 'from-cyan-500 to-blue-500'}`} />
                    
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
                        <X size={20} />
                    </button>

                    <div className="p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            {loading ? (
                                <div className="animate-bounce p-4 rounded-full bg-white/5">
                                    <Flame size={40} className="text-orange-500 animate-pulse" />
                                </div>
                            ) : (
                                <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-xl">
                                    {tierIcons[tier]}
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">Rejection Roast</h2>
                        <p className="text-slate-400 text-sm mb-6">Application: <span className="text-cyan-400 font-medium">{applicationTitle}</span></p>

                        <div className="bg-black/40 rounded-xl p-6 border border-white/5 relative">
                            {loading ? (
                                <div className="space-y-2">
                                    <div className="h-4 bg-white/5 rounded w-3/4 mx-auto animate-pulse"></div>
                                    <div className="h-4 bg-white/5 rounded w-1/2 mx-auto animate-pulse"></div>
                                </div>
                            ) : (
                                <p className="text-slate-200 italic font-serif leading-relaxed">
                                    "{roast}"
                                </p>
                            )}
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={onClose}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition border border-white/10"
                            >
                                I Deserve This. Close.
                            </button>
                        </div>

                        {tier === 3 && (
                            <p className="mt-4 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                                Critical Failure: Seek Assistance Immediately
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RejectionRoastModal;
