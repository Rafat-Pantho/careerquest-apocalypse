import React from 'react';
import { motion } from 'framer-motion';
import CareerRoadmap from '../components/CareerRoadmap';
import BountyGrid from '../components/BountyGrid';
import InterviewDashboard from '../components/InterviewDashboard';
import CareerOracleWidget from '../components/CareerOracleWidget';
import FrameAnimation from '../components/FrameAnimation';
import SkillRadar from '../components/SkillRadar';
import { User, Bell, Briefcase, Search, Menu, Zap } from 'lucide-react';

import CreatePostModal from '../components/CreatePostModal';
import CreateBountyModal from '../components/CreateBountyModal';
import ActiveBountyArena from '../components/ActiveBountyArena';
import { useWeirdMode } from '../context/WeirdModeContext';

import DoomScopeWidget from '../components/DoomScopeWidget';
import GhostedCounter from '../components/GhostedCounter';
import RejectionRoastModal from '../components/RejectionRoastModal';



function StudentDashboard() {
    const { isWeirdMode, toggleWeirdMode } = useWeirdMode();
    const [showPostModal, setShowPostModal] = React.useState(false);
    const [activeGameBounty, setActiveGameBounty] = React.useState(null);
    const [localWeirdBounties, setLocalWeirdBounties] = React.useState([]);
    const [applications, setApplications] = React.useState([]);
    const [roastModal, setRoastModal] = React.useState({ open: false, id: null, title: '' });


    // Always read fresh from localStorage so it doesn't go stale
    const userData = React.useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
    const userClass = userData.characterClass || 'Mage';
    
    // Server Statistics and DB Bounties Tracker
    const [classStats, setClassStats] = React.useState({});

    const fetchBounties = React.useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetch('http://localhost:8000/api/bounties', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.bounties) {
                    const formatted = data.bounties.map(b => ({
                        id: b._id,
                        title: b.title,
                        type: b.type === 'job' ? 'Chaos' : 'Tuition',
                        rate: `৳${b.reward}`,
                        tags: [`${b.difficulty}`, 'New'],
                        urgency: 'Immediate',
                        characterClass: b.characterClass || 'Any',
                        authorEmail: b.postedBy?.email,
                        postedById: b.postedBy?._id,
                        goblinCount: Math.floor(b.reward / 10) || 15
                    }));
                    setLocalWeirdBounties(formatted);
                }
            })
            .catch(console.error);
    }, []);

    const fetchApplications = React.useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetch('http://localhost:8000/api/applications/my-applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setApplications(data.applications || []);
            })
            .catch(console.error);

    }, []);

    React.useEffect(() => {
        // Fetch Stats
        fetch('http://localhost:8000/api/auth/stats/classes')
            .then(r => r.json())
            .then(data => setClassStats(data))
            .catch(console.error);

        // Fetch Live Bounties from DB on mount
        fetchBounties();
        fetchApplications();
    }, [fetchBounties, fetchApplications]);

    
    // XP and Gamification Logic
    const [userXp, setUserXp] = React.useState(userData.xp || 0);
    const userLevel = userXp >= 1 ? Math.floor(Math.log2(userXp)) + 1 : 1;
    const currentLevelFloor = userLevel > 1 ? Math.pow(2, userLevel - 1) : 0;
    const nextLevelXp = Math.pow(2, userLevel);
    const xpIntoLevel = userXp - currentLevelFloor;
    const xpNeededForLevel = nextLevelXp - currentLevelFloor;
    const xpPercent = Math.min((xpIntoLevel / xpNeededForLevel) * 100, 100);

    const handlePointsEarned = async (pts) => {
        setUserXp(prev => prev + pts);
        // Persist to backend
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/auth/xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: pts })
            });
            const data = await res.json();
            if (data.xp !== undefined) {
                setUserXp(data.xp);
                // Update localStorage too
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, xp: data.xp }));
            }
        } catch (e) {
            console.error('XP sync failed', e);
        }
    };

    const handlePostSuccess = () => {
        // Maybe refresh data here later
        alert("Post created successfully!");
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-cyan-400/30 selection:text-cyan-400">
            {/* Navbar */}
            <nav className="fixed w-full bg-navy-950/80 backdrop-blur-md z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <span className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold font-display text-xl shadow-lg shadow-cyan-400/20">C</span>
                            <span className="text-xl font-bold tracking-tight font-display text-white">Career<span className="text-cyan-400">Quest</span></span>
                        </div>

                        <div className="hidden md:flex items-center space-x-1 text-sm font-medium text-slate-400">
                            <a href="#" className="text-white bg-white/5 px-4 py-2 rounded-full border border-white/5">Dashboard</a>
                            <a href="/marketplace" className="hover:text-cyan-400 px-4 py-2 transition">Marketplace</a>
                            <a href="/network" className="hover:text-cyan-400 px-4 py-2 transition">Network</a>
                            <button onClick={toggleWeirdMode} className="text-purple-500 hover:text-purple-400 px-4 py-2 transition font-mono tracking-widest animate-pulse border border-purple-500/20 rounded-full hover:bg-purple-500/10">
                                {isWeirdMode ? 'NORMALIZE' : '???'}
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-cyan-400 transition relative" aria-label="Notifications">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                            </button>

                            {localStorage.getItem('token') ? (
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col items-center gap-0.5 bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] min-w-[80px]">
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span className="text-purple-300 text-xs font-bold font-display uppercase tracking-widest">{userClass}</span>
                                            <span className="text-[9px] text-cyan-400 font-mono font-bold">LV{userLevel}</span>
                                        </div>
                                        {/* Compact XP bar */}
                                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${xpPercent}%`,
                                                    background: 'linear-gradient(90deg, #a855f7, #06b6d4)',
                                                    boxShadow: '0 0 4px rgba(168,85,247,0.8)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div onClick={() => window.location.href = '/profile'} className="w-9 h-9 bg-navy-800 rounded-full overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:border-cyan-400 transition relative">
                                        <img src={`/images/characters/${userClass.toLowerCase()}.png`} alt="User Avatar" className="object-cover w-[150%] h-[150%] absolute -top-2 -left-2" onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"; e.target.className = "w-full h-full"; }} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            window.location.href = '/login';
                                        }}
                                        className="text-xs font-bold text-slate-400 hover:text-red-400 transition uppercase tracking-wider"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white border border-white/10 transition"
                                >
                                    Log In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <div className="flex flex-col gap-1 mt-1 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest font-display">User Tier</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 uppercase tracking-widest font-display">Level {userLevel}</span>
                                <span className="text-[10px] text-purple-300 font-mono">{userXp} / {nextLevelXp} XP</span>
                            </div>
                            {/* XP Progress Bar */}
                            <div className="flex items-center gap-2">
                                <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${xpPercent}%`,
                                            background: 'linear-gradient(90deg, #a855f7, #06b6d4)',
                                            boxShadow: '0 0 8px rgba(168,85,247,0.6)'
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{Math.round(xpPercent)}%</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-2">
                            {isWeirdMode ? "Welcome to the Void, Mortal" : `Welcome back, ${userData.name?.split(' ')[0] || 'User'}`}
                        </h1>
                        <p className="text-slate-400 max-w-xl font-light">
                            {isWeirdMode ?
                                "Your destiny is untethered. You have 2 pending dooms and 5 existential crises." :
                                "Your career trajectory is expedited. You have 2 pending interviews and 5 targeted matches."
                            }
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="bg-cyan-400 hover:bg-cyan-300 text-navy-950 px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 transition flex items-center gap-2 transform hover:-translate-y-0.5">
                            <Zap size={18} fill="currentColor" />
                            Post Tuition / Service
                        </button>
                        
                        {/* Server Population Tracker */}
                        <div className="glass-card px-4 py-2 flex items-center gap-3 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Realm Population</span>
                            </div>
                            <div className="flex gap-2 border-l border-white/10 pl-3">
                                {Object.entries(classStats).map(([cls, count]) => (
                                    <div key={cls} className="flex gap-1 items-baseline">
                                        <span className="text-[10px] text-purple-300 font-bold uppercase">{cls}:</span>
                                        <span className="text-xs text-white font-mono">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(classStats).length === 0 && <span className="text-[10px] text-slate-500">Scanning...</span>}
                            </div>
                        </div>
                    </div>

                </header >

                {isWeirdMode ? (
                    <CreateBountyModal
                        isOpen={showPostModal}
                        onClose={() => setShowPostModal(false)}
                        onSubmit={(data) => {
                            // Post to backend and then re-fetch so ALL users see the new bounty
                            const token = localStorage.getItem('token');
                            fetch('http://localhost:8000/api/bounties', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(token && {'Authorization': `Bearer ${token}`})
                                },
                                body: JSON.stringify({
                                    title: data.title,
                                    description: data.description,
                                    reward: data.reward,
                                    difficulty: 'Expert', 
                                    type: 'job',
                                    characterClass: userData.characterClass
                                })
                            })
                            .then(r => r.json())
                            .then((saved) => {
                                console.log('POST /api/bounties response:', saved);
                                // The backend returns { message, bounty: { ... } }
                                if (saved.bounty?._id || saved._id) {
                                    fetchBounties();
                                    handlePostSuccess();
                                    setShowPostModal(false); // Close the modal on success
                                } else {
                                    alert('Failed to post bounty: ' + (saved.error || JSON.stringify(saved)));
                                }
                            })

                            .catch(err => {
                                console.error('Network error posting bounty:', err);
                                alert('Network error: ' + err.message);
                            });
                        }}
                    />
                ) : (
                    <CreatePostModal
                        isOpen={showPostModal}
                        onClose={() => setShowPostModal(false)}
                        onSuccess={handlePostSuccess}
                    />
                )}

                {/* Conditional Content: Dashboard vs Active Hunt */}
                {activeGameBounty ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-12">
                        <ActiveBountyArena 
                            bountyData={{
                                id: activeGameBounty.id,
                                title: activeGameBounty.title,
                                targetCount: activeGameBounty.goblinCount || parseInt(activeGameBounty.tags?.[0]?.replace(/\D/g, '') || 15),
                                reward: parseInt(activeGameBounty.rate?.replace(/\D/g, '') || 100),
                                characterClass: activeGameBounty.characterClass || 'Hunter'
                            }}
                            onPointsEarned={handlePointsEarned}
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
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                            <div className="glass-card p-4 border border-purple-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                    <h3 className="text-purple-400 font-bold font-display uppercase tracking-wider text-sm">Quest Focus: Active</h3>
                                </div>
                                <p className="text-xs text-purple-300/60 font-mono">Existential analysis threads paused. Concentrate on the hunt.</p>
                            </div>
                            <div className="glass-card p-4 border border-cyan-400/30">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-cyan-400 font-bold font-display uppercase tracking-wider text-sm">Roadmap Suspended</h3>
                                    <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/20">IN COMBAT</span>
                                </div>
                                <p className="text-xs text-cyan-300/60 font-mono line-clamp-1">Current Objective: {activeGameBounty.title}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Hero Animation Tile - Large */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 rounded-2xl overflow-hidden glass-card h-[400px]"
                    >
                        <FrameAnimation />
                    </motion.div>

                    {/* Skill Radar Tile - Vertical */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1 rounded-2xl glass-card p-1"
                    >
                        <SkillRadar />
                    </motion.div>

                    {/* Roadmap Tile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1 rounded-2xl glass-card overflow-hidden"
                    >
                        <CareerRoadmap />
                    </motion.div>

                    {/* Doom-Scope Tile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="lg:col-span-1 rounded-2xl overflow-hidden"
                    >
                        <DoomScopeWidget />
                    </motion.div>

                    {/* Ghosted Counter Tile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="lg:col-span-1 rounded-2xl overflow-hidden"
                    >
                        <GhostedCounter />
                    </motion.div>




                    {/* Interview Simulator or Oracle Tile - Wide */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`lg:col-span-2 rounded-2xl overflow-hidden glass-card ${isWeirdMode ? 'border border-purple-500/30' : ''}`}
                    >
                        {isWeirdMode ? (
                            <CareerOracleWidget />
                        ) : (
                            <>
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-xl font-display font-bold text-white">Interview Simulator</h3>
                                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">AI-ACTIVE</span>
                                </div>
                                <InterviewDashboard />
                            </>
                        )}
                    </motion.div>

                </div>

                {/* Bounties Section */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-8 gap-4">
                        <div>
                            <h3 className="text-2xl font-display font-bold text-white">Curated Bounties</h3>
                            <p className="text-slate-400 text-sm">High-value opportunities matched to your profile</p>
                        </div>

                        {/* Rejected Applications Roast Center */}
                        {applications.some(app => app.status === 'rejected') && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Rejection Center</span>
                                <div className="flex gap-2">
                                    {applications.filter(app => app.status === 'rejected').map(app => (
                                        <button 
                                            key={app._id} 
                                            onClick={() => setRoastModal({ open: true, id: app._id, title: app.bounty.title })}
                                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold rounded transition transform hover:scale-105"
                                        >
                                            ROAST {app.bounty.title.slice(0, 10)}...
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search opportunities..."
                                className="pl-10 pr-4 py-2 rounded-lg bg-navy-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 text-sm w-64 transition-colors"
                            />
                        </div>
                    </div>
                        <BountyGrid 
                            additionalWeirdItems={localWeirdBounties}
                            onAccept={(job) => {
                                if (isWeirdMode) {
                                    setActiveGameBounty(job);
                                    // Scroll to top
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    console.log("Viewing job: ", job);
                                }
                            }} 
                        />
                    </section>
                    </>
                )}

                <RejectionRoastModal
                    isOpen={roastModal.open}
                    onClose={() => setRoastModal({ open: false, id: null, title: '' })}
                    applicationId={roastModal.id}
                    applicationTitle={roastModal.title}
                />
            </main >
        </div >
    )
}

export default StudentDashboard