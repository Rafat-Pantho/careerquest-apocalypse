import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ghost, XCircle, TrendingUp } from 'lucide-react';

const GhostedCounter = () => {
    const [stats, setStats] = useState({ ghosted: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8000/api/applications/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const apps = Array.isArray(data.applications) ? data.applications : [];
                
                const ghosted = apps.filter(app => app.status === 'pending' || app.status === 'applied').length;
                const rejected = apps.filter(app => app.status === 'rejected').length;
                
                setStats({ ghosted, rejected, total: apps.length });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return null;

    return (
        <div className="bg-navy-900 border border-white/5 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Application Reality Check</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Ghost size={16} />
                            <span className="text-2xl font-bold font-display">{stats.ghosted}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Ghosted</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-500">
                            <XCircle size={16} />
                            <span className="text-2xl font-bold font-display">{stats.rejected}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Rejected</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <TrendingUp size={14} className="text-cyan-400" />
                        <span>Persistence Score</span>
                    </div>
                    <span className="text-cyan-400 font-bold text-sm">
                        {stats.total > 0 ? Math.round((stats.total / 10) * 100) : 0}%
                    </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (stats.total / 10) * 100)}%` }}
                        className="bg-cyan-400 h-full rounded-full"
                    ></motion.div>
                </div>
            </div>
        </div>
    );
};

export default GhostedCounter;
