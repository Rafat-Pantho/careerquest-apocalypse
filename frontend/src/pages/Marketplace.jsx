import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Zap } from 'lucide-react';
import { useWeirdMode } from '../context/WeirdModeContext';
import BountyGrid from '../components/BountyGrid';
import CreatePostModal from '../components/CreatePostModal';
import CreateBountyModal from '../components/CreateBountyModal';
import ActiveBountyArena from '../components/ActiveBountyArena';


const Marketplace = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [bounties, setBounties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const { isWeirdMode } = useWeirdMode();
    const [activeGameBounty, setActiveGameBounty] = useState(null);

    const filters = ['All', 'Tuition', 'Job', 'Internship', 'Skills Exchange'];

    const fetchBounties = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8000/api/bounties');
            const data = await res.json();

            if (data.bounties) {
                // Map backend data to frontend component structure
                const mapped = data.bounties.map(b => ({
                    id: b._id,
                    type: b.type.charAt(0).toUpperCase() + b.type.slice(1),
                    title: b.title,
                    rate: `৳${b.reward}`,
                    tags: [b.difficulty, ...(b.type === 'tuition' ? ['Education'] : ['Remote'])], // Mock tags for now
                    urgency: b.difficulty === 'Expert' ? 'High' : 'Med',
                    description: b.description,
                    characterClass: b.characterClass || 'Any'
                }));
                setBounties(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch bounties:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBounties();
    }, []);

    const handlePostSuccess = () => {
        fetchBounties();
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-cyan-400/30 selection:text-cyan-400">
            {/* Navbar Placeholder */}
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

            {isWeirdMode ? (
                <CreateBountyModal
                    isOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    onSubmit={(data) => {
                        console.log("Weird Bounty Created:", data);
                        handlePostSuccess();
                    }}
                />
            ) : (
                <CreatePostModal
                    isOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    onSuccess={handlePostSuccess}
                />
            )}

            {activeGameBounty && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                         <ActiveBountyArena 
                            bountyData={{
                                id: activeGameBounty.id,
                                title: activeGameBounty.title,
                                targetCount: 15,
                                reward: parseInt(activeGameBounty.rate?.replace(/\D/g, '') || 100),
                                characterClass: activeGameBounty.characterClass || 'Mage'
                            }}
                            onComplete={async () => {
                                const token = localStorage.getItem('token');
                                try {
                                    const res = await fetch(`http://localhost:8000/api/bounties/${activeGameBounty.id}/complete`, {
                                        method: 'PATCH',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const data = await res.json();
                                    if (data.message) {
                                        alert(`Bounty Cleared! Creator earned ${data.creatorAwardedXp || 0} bonus XP.`);
                                    }
                                } catch (e) {
                                    console.error('Finalizing bounty failed', e);
                                }
                                setActiveGameBounty(null);
                                fetchBounties();
                            }}
                            onFlee={() => setActiveGameBounty(null)}
                            onPointsEarned={async (pts) => {
                                try {
                                    const token = localStorage.getItem('token');
                                    if (!token) return;
                                    await fetch('http://localhost:8000/api/auth/xp', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ amount: pts })
                                    });
                                } catch (e) { console.error('XP sync failed', e); }
                            }}
                        />
                    </div>
                </div>
            )}


            <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2">Opportunity Marketplace</h1>
                        <p className="text-slate-400">Discover tuitions, freelance gigs, and internships tailored for students.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="bg-cyan-400 hover:bg-cyan-300 text-navy-950 px-5 py-3 rounded-xl font-bold shadow-lg shadow-cyan-400/20 transition flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Zap size={18} fill="currentColor" />
                            Post Opportunity
                        </button>
                    </div>
                </div>

                {/* Search Bar Row (Moved down for better mobile layout) */}
                <div className="flex gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by skill, role, or company..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                        />
                    </div>
                    <button className="bg-navy-800 hover:bg-navy-700 text-white p-3 rounded-xl border border-white/10 transition">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${filter === f ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 shadow-lg shadow-cyan-400/10' : 'bg-navy-900/50 text-slate-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Job Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <BountyGrid items={
                        filter === 'All'
                            ? bounties
                            : bounties.filter(job => job.type.toLowerCase() === filter.toLowerCase())
                    } onAccept={(job) => {
                        if (isWeirdMode) {
                            setActiveGameBounty(job);
                        } else {
                            // Standard behavior
                            console.log("Viewing job: ", job);
                        }
                    }} />
                )}

                {!loading && bounties.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        No opportunities found. Be the first to post!
                    </div>
                )}

                {/* Load More */}
                {!loading && bounties.length > 0 && (
                    <div className="text-center mt-12">
                        <button className="px-6 py-3 bg-navy-900 border border-white/10 text-slate-300 rounded-xl hover:text-white hover:border-cyan-400/30 transition">
                            Load More Opportunities
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
};

export default Marketplace;