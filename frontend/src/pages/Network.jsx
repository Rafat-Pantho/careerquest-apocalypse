import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, ArrowLeft, MessageSquare } from 'lucide-react';

const Network = () => {
    const navigate = useNavigate();

    const peers = [
        { name: 'Rahim Ahmed', role: 'CS Student @ BUET', status: 'Online', skills: ['React', 'Node'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim' },
        { name: 'Sarah Islam', role: 'Intern @ GP', status: 'Offline', skills: ['Python', 'AI'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { name: 'Tanvir Hasan', role: 'Full Stack Dev', status: 'In a Call', skills: ['Vue', 'Laravel'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir' },
        { name: 'Nadia Khan', role: 'Product Designer', status: 'Online', skills: ['Figma', 'UI/UX'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia' },
    ];

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-cyan-400/30 selection:text-cyan-400">
            <nav className="fixed w-full bg-navy-950/80 backdrop-blur-md z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/student-dashboard')}>
                        <span className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold font-display text-xl shadow-lg shadow-cyan-400/20">C</span>
                        <span className="text-xl font-bold tracking-tight font-display text-white">Career<span className="text-cyan-400">Quest</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/student-dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 transition">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2">Peer Synergy</h1>
                        <p className="text-slate-400">Connect with classmates, alumni, and industry mentors.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Find peers by skill or university..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {peers.map((peer, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6 rounded-2xl flex items-center gap-5 hover:bg-navy-900/60 transition group"
                        >
                            <div className="relative">
                                <img src={peer.avatar} alt={peer.name} className="w-16 h-16 rounded-full border-2 border-navy-800 bg-navy-800" />
                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-navy-950 ${peer.status === 'Online' ? 'bg-green-500' :
                                        peer.status === 'Offline' ? 'bg-slate-500' : 'bg-amber-500'
                                    }`}></div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{peer.name}</h3>
                                <p className="text-slate-400 text-sm mb-2">{peer.role}</p>
                                <div className="flex gap-2">
                                    {peer.skills.map(s => (
                                        <span key={s} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300 border border-white/5">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button className="p-2 bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-navy-950 transition">
                                    <UserPlus size={18} />
                                </button>
                                <button className="p-2 bg-navy-800 text-slate-400 rounded-lg hover:text-white transition">
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Network;