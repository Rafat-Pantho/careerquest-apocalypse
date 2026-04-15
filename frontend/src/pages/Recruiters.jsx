import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Building, MapPin, ArrowLeft, ExternalLink } from 'lucide-react';

const Recruiters = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    const handleConnect = (companyName) => {
        setNotification(`Connection request sent to ${companyName}!`);
        setTimeout(() => setNotification(null), 3000);
    };

    const companies = [
        { name: 'Pathao', industry: 'Ride Sharing / Tech', location: 'Dhaka', jobs: 12, logo: 'https://logo.clearbit.com/pathao.com' },
        { name: 'Bkash', industry: 'Fintech', location: 'Dhaka', jobs: 8, logo: 'https://logo.clearbit.com/bkash.com' },
        { name: 'Grameenphone', industry: 'Telecommunications', location: 'Dhaka', jobs: 5, logo: 'https://logo.clearbit.com/grameenphone.com' },
        { name: 'Brain Station 23', industry: 'Software Development', location: 'Dhaka', jobs: 20, logo: 'https://brainstation-23.com/wp-content/uploads/2019/02/BrainStation23-logo.png' }, // Fallback could affect this but let's try
        { name: 'Chaldal', industry: 'E-commerce', location: 'Dhaka', jobs: 3, logo: 'https://logo.clearbit.com/chaldal.com' },
    ];

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-cyan-400/30 selection:text-cyan-400">
            {notification && (
                <div className="fixed top-24 right-4 bg-cyan-400 text-navy-950 px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                    <span>✓</span> {notification}
                </div>
            )}
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
                        <h1 className="text-4xl font-display font-bold text-white mb-2">Connect with Recruiters</h1>
                        <p className="text-slate-400">Follow top companies and get notified about exclusive roles.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companies.map((company, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6 rounded-2xl flex items-center gap-6 hover:border-cyan-400/30 transition group cursor-pointer"
                        >
                            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden shadow-lg shadow-black/10">
                                {/* Fallback icon if image fails, simple text */}
                                {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                                ) : null}
                                <div className="hidden w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-xs">{company.name[0]}</div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">{company.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                                    <span className="flex items-center gap-1"><Building size={14} /> {company.industry}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {company.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold border border-amber-500/20">{company.jobs} Open Roles</span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleConnect(company.name);
                                }}
                                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-cyan-400 hover:text-navy-950 transition" title="Connect"
                            >
                                <ExternalLink size={20} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Recruiters;