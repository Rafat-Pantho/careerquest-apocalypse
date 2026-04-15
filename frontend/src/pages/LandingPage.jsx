import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, GraduationCap, ChevronRight, Globe, TrendingUp, Users } from 'lucide-react';
import FrameAnimation from '../components/FrameAnimation';

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="min-h-screen bg-navy-950 text-white overflow-x-hidden font-sans selection:bg-cyan-400/30 selection:text-cyan-400">

            {/* Navbar */}
            <nav className="fixed w-full bg-navy-950/80 backdrop-blur-md z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold font-display text-xl shadow-lg shadow-cyan-400/20">C</span>
                        <span className="text-2xl font-bold tracking-tight font-display text-white">Career<span className="text-cyan-400">Quest</span></span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/login')} className="px-6 py-2 text-slate-300 font-medium hover:text-cyan-400 transition">Log In</button>
                        <button onClick={() => navigate('/register')} className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full font-medium hover:opacity-90 transition shadow-lg shadow-cyan-400/20">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                {/* Prestige Mesh Gradients */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-400/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4"></div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-navy-900 border border-cyan-400/20 text-cyan-400 font-medium text-sm mb-6 shadow-lg shadow-cyan-400/5 backdrop-blur-sm">
                            ✨ The Professional Ecosystem
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold font-display text-white leading-[1.1] mb-8">
                            Master Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 animate-gradient">Future Self</span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-light">
                            The elite platform for career acceleration. Connect with industry leaders, secure premium tuition gigs, and leverage AI for exponential growth.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-cyan-400 text-navy-950 rounded-xl font-bold shadow-xl shadow-cyan-400/20 flex items-center justify-center gap-2 text-lg hover:bg-cyan-300 transition-colors"
                            >
                                Begin Quest <ChevronRight size={20} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-navy-900/50 backdrop-blur-md text-white border border-white/10 rounded-xl font-medium shadow-sm hover:border-cyan-400/50 transition flex items-center justify-center gap-2 text-lg"
                            >
                                Explore Opportunities
                            </motion.button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-slate-400 text-sm font-medium">
                            <div className="flex -space-x-4">
                                <img className="w-10 h-10 rounded-full border-2 border-navy-950" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="" />
                                <img className="w-10 h-10 rounded-full border-2 border-navy-950" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="" />
                                <img className="w-10 h-10 rounded-full border-2 border-navy-950" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" alt="" />
                                <div className="w-10 h-10 rounded-full border-2 border-navy-950 bg-navy-800 flex items-center justify-center text-xs text-cyan-400 font-bold font-mono">+2k</div>
                            </div>
                            <p>Elite talent from BUET, IBA & NSU</p>
                        </div>
                    </motion.div>

                    {/* Animated Hero Component */}
                    <motion.div
                        style={{ y: y1 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/20 border border-white/10 glass-card transform rotate-1 hover:rotate-0 transition duration-700 group">
                            {/* Using the FrameAnimation component here */}
                            <FrameAnimation />

                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/20 to-transparent pointer-events-none"></div>

                            <div className="absolute bottom-6 left-6 right-6 text-white text-center pointer-events-none">
                                <p className="font-display text-2xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">Shape Your Destiny</p>
                                <p className="text-slate-400 text-sm font-mono">AI-Driven Optimization</p>
                            </div>
                        </div>

                        {/* Floating Glass Cards */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -right-8 glass-card p-4 rounded-xl flex items-center gap-3 z-20 max-w-xs border border-white/5"
                        >
                            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-display">Skill Match</p>
                                <p className="font-bold text-white text-lg font-mono">98%</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-8 -left-12 glass-card p-4 rounded-xl flex items-center gap-3 z-20 max-w-xs border border-white/5"
                        >
                            <div className="p-3 bg-cyan-400/10 rounded-lg text-cyan-400 border border-cyan-400/20">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-display">New Offer</p>
                                <p className="font-bold text-white text-lg">Sent to GP</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">The Professional Suite</h2>
                        <p className="text-slate-400 text-lg font-light">A comprehensive ecosystem designed for the modern professional.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Globe size={24} />, title: "Tuition Marketplace", desc: "Secure verified opportunities with automated payment tracking." },
                            { icon: <Users size={24} />, title: "Peer Synergy", desc: "Collaborate with high-caliber alumni from your network." },
                            { icon: <TrendingUp size={24} />, title: "Cognitive Analysis", desc: "AI-powered gap analysis to bridge your skill deficiencies." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-2xl glass-card hover:bg-navy-900/60 transition group cursor-default"
                            >
                                <div className="w-14 h-14 bg-navy-800 rounded-xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg shadow-black/20">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;