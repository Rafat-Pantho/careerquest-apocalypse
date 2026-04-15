import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Skull, Zap } from 'lucide-react';
import { useWeirdMode } from '../context/WeirdModeContext';

const bounties = [
    { id: 1, type: 'Tuition', title: 'HSC Math Tutor (Dhanmondi)', rate: '৳500/hr', tags: ['Math', 'Offline'], urgency: 'High', characterClass: 'Mage' },
    { id: 2, type: 'Freelance', title: 'React Dashboard UI (Startup)', rate: '৳4,000/fix', tags: ['React', 'Remote'], urgency: 'Med', characterClass: 'Fighter' },
    { id: 3, type: 'Tuition', title: 'IELTS Instructor', rate: '৳800/hr', tags: ['English', 'Zoom'], urgency: 'Low', characterClass: 'Hunter' },
    { id: 4, type: 'Freelance', title: 'Content Writer (Bangla/Eng)', rate: '৳1,000/1k words', tags: ['SEO', 'Writing'], urgency: 'Med', characterClass: 'Assassin' },
    { id: 5, type: 'Exchange', title: 'Python for Accounting', rate: 'Barter', tags: ['Python', 'Finance'], urgency: 'High', characterClass: 'Healer' },
    { id: 6, type: 'Tuition', title: 'Class 8 Science Tutor', rate: '৳400/hr', tags: ['Science', 'Bashundhara'], urgency: 'High', characterClass: 'Tank' },
    { id: 7, type: 'Freelance', title: 'Spellbook Translation', rate: '৳5000/doc', tags: ['Magic', 'Writing'], urgency: 'High', characterClass: 'Mage' },
    { id: 8, type: 'Exchange', title: 'Sword Sharpening Script', rate: 'Barter', tags: ['Blacksmith', 'Weaponry'], urgency: 'Med', characterClass: 'Fighter' },
];

const weirdBounties = [
    { id: 101, type: 'Chaos', title: 'Manual Pixel Alignment', rate: '৳0.05/px', tags: ['Pain', 'Ocular'], urgency: 'Fatal', characterClass: 'Assassin' },
    { id: 102, type: 'Void', title: 'Cloud Shouter (Upload Speed)', rate: '৳50/scream', tags: ['Vocal', 'Networking'], urgency: 'Loud', characterClass: 'Tank' },
    { id: 103, type: 'Entropy', title: 'Undo Sent Email (Physically)', rate: '৳100/pkt', tags: ['Running', 'Packet Loss'], urgency: 'Immediate', characterClass: 'Hunter' },
    { id: 104, type: 'Absurd', title: "Verify Keyboard 'Clack'", rate: '৳20/clack', tags: ['Mechanical', 'ASMR'], urgency: 'Low', characterClass: 'Healer' },
    { id: 105, type: 'Existential', title: 'Stare into Abyss', rate: 'Exposure', tags: ['Philosophical', 'Time'], urgency: 'Eternal', characterClass: 'Mage' },
    { id: 106, type: 'Gitch', title: 'Defeat Layout Shift', rate: 'High Score', tags: ['CSS', 'Violence'], urgency: 'High', characterClass: 'Fighter' },
];

const BountyGrid = ({ items, onAccept, additionalWeirdItems = [] }) => {
    const { isWeirdMode } = useWeirdMode();
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    // In weird mode: use DB bounties only (additionalWeirdItems)
    // In normal mode: use items prop or hardcoded bounties
    let data = isWeirdMode ? additionalWeirdItems : (items || bounties);
    
    // Filter by character class
    if (user && user.characterClass && user.characterClass !== 'None') {
        data = data.filter(job => job.characterClass === user.characterClass || job.characterClass === 'Any' || !job.characterClass);
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 italic">
                No quests available for your character class ({user?.characterClass}) right now in this realm.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((job, idx) => (
                <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isWeirdMode ? 'bg-black border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'glass-card'}`}
                >
                    <div className={`absolute inset-x-0 bottom-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origins-left ${isWeirdMode ? 'bg-purple-600' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>

                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${isWeirdMode ? 'bg-purple-900/20 text-purple-400 border-purple-500/20' :
                            job.type === 'Tuition' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' :
                                job.type === 'Freelance' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                    'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}>
                            {job.type}
                        </span>
                        <span className={`font-mono font-bold flex items-center gap-1 ${isWeirdMode ? 'text-purple-300' : 'text-white'}`}>
                            {!isWeirdMode && <span className="text-amber-500 text-lg">৳</span>}
                            {job.rate.replace('৳', '')}
                        </span>
                    </div>

                    <h4 className={`text-md font-bold font-display mb-2 transition-colors line-clamp-1 ${isWeirdMode ? 'text-purple-100 group-hover:text-purple-400' : 'text-white group-hover:text-cyan-400'}`}>
                        {job.title}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags.map(tag => (
                            <span key={tag} className={`text-[10px] px-2 py-1 rounded-full ${isWeirdMode ? 'bg-purple-900/10 text-purple-400 border border-purple-500/10' : 'bg-white/5 text-slate-300 border border-white/10'}`}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    {isWeirdMode && (
                        <div className="mb-4">
                            <div className="flex justify-between text-[10px] text-purple-500 mb-1 uppercase tracking-widest">
                                <span>Drama Meter</span>
                                <span>{Math.floor(Math.random() * 100)}%</span>
                            </div>
                            <div className="h-1 bg-purple-900/30 w-full rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className={`pt-4 border-t flex justify-between items-center text-sm ${isWeirdMode ? 'border-purple-500/10 text-purple-500/50' : 'border-white/5 text-slate-400'}`}>
                        <div className="flex items-center gap-1">
                            {isWeirdMode ? <Skull size={14} /> : <Briefcase size={14} />}
                            <span>{isWeirdMode ? 'Ritual' : 'Project'}</span>
                        </div>
                        {/* Own post check: compare by _id or email */}
                        {user && (job.authorEmail === user?.email || job.postedById === user?._id) ? (
                            <span className="font-medium text-sm flex items-center gap-1 text-slate-500 italic">
                                Your Post
                            </span>
                        ) : (
                            <button 
                                onClick={() => onAccept && onAccept(job)}
                                className={`font-medium text-sm flex items-center gap-1 transition-colors ${isWeirdMode ? 'text-purple-400 hover:text-white' : 'text-cyan-400 hover:text-white'}`}
                            >
                                {isWeirdMode ? 'Summon' : 'View'} <span className="text-xs">→</span>
                            </button>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default BountyGrid;