import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Zap, Ghost } from 'lucide-react';

const DoomScopeWidget = () => {
    const [doom, setDoom] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDoom = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/doom-scope', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setDoom(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoom();
    }, []);

    if (loading) {
        return (
            <div className="bg-black/60 border border-white/5 rounded-2xl p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-black/80 border border-red-500/30 rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-red-500/20"></div>

            <div>
                <div className="flex items-center gap-2 mb-4 text-red-500">
                    <Skull size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Daily Doom-Scope</span>
                </div>

                <p className="text-slate-300 text-sm italic leading-relaxed mb-6 font-serif">
                    "{doom?.prophecy || 'The stars align in a pattern of complete market collapse.'}"
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 uppercase flex items-center gap-1"><Zap size={14} className="text-yellow-500" /> Lucky Skill</span>
                    <span className="text-yellow-400 font-bold">{doom?.luckySkill || 'Sleeping'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 uppercase flex items-center gap-1"><Ghost size={14} className="text-purple-500" /> Cursed Company</span>
                    <span className="text-purple-400 font-bold truncate max-w-[120px]">{doom?.cursedCompany || 'Everywhere'}</span>
                </div>
            </div>

            <button 
                onClick={fetchDoom}
                className="mt-6 w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-tighter border border-red-500/20 transition-all"
            >
                Consult The Void
            </button>
        </div>
    );
};

export default DoomScopeWidget;
