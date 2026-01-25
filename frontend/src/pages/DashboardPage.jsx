import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// Daily prophecies/quotes
const prophecies = [
  "The bug you seek is not in the code, but in the requirements.",
  "A thousand lines of code begin with a single function.",
  "The best error message is the one that never shows up.",
  "Those who master recursion shall understand recursion.",
  "Legacy code: treasure to those who inherit, trial to those who maintain.",
  "The senior developer also once Googled 'how to center a div'.",
  "Document your code, for your future self is but a stranger.",
  "Coffee transforms into code. This is the way.",
  "First, make it work. Then, make it right. Then, make it fast.",
  "Your imposter syndrome is wrong. You do belong here.",
];

const StatCard = ({ title, value, icon, color, trend }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`dungeon-card border-l-4 ${color} p-6 relative overflow-hidden`}
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-parchment-400 text-sm font-cinzel mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-parchment-100">{value}</h3>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">{icon}</div>
  </motion.div>
);

const ProgressRing = ({ progress, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="text-dungeon-700"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        className="text-gold-500"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
        }}
      />
    </svg>
  );
};

const DashboardPage = () => {
  const { user, token: _token } = useAuth();
  const { onlineUsers, questCount } = useSocket();
  const greeting = getGreeting();
  const timeOfDay = getTimeOfDay();

  const [recentQuests, setRecentQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get random prophecy based on day
  const todaysProphecy = prophecies[new Date().getDate() % prophecies.length];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const questsRes = await axios.get(`${API_URL}/quests`);
        setRecentQuests(questsRes.data.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calculate level progress
  const xpForNextLevel = (user?.level || 1) * 1000;
  const currentXP = user?.experience || 0;
  const levelProgress = Math.min(100, (currentXP / xpForNextLevel) * 100);

  // Calculate profile completion
  const profileFields = [
    user?.heroName,
    user?.heroClass,
    user?.heroicSummary,
    user?.specialAttacks?.length > 0,
    user?.battleHistory?.length > 0,
    user?.trainingGrounds?.length > 0,
    user?.avatar
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  return (
    <DashboardLayout>
      {/* Header with Time-based greeting */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-cinzel text-gold-400 mb-2">
              {greeting}, {user?.heroName || 'Hero'}
            </h1>
            <p className="text-parchment-300">
              {timeOfDay === 'morning' && '☀️ A new day awaits. What quests will you conquer?'}
              {timeOfDay === 'afternoon' && '⚔️ The battle continues. Stay focused, warrior.'}
              {timeOfDay === 'evening' && '🌙 The day draws to a close. Rest and prepare for tomorrow.'}
              {timeOfDay === 'night' && '🌟 Burning the midnight oil? True dedication, hero.'}
            </p>
          </div>
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-parchment-400">Level {user.level || 1}</p>
                <p className="text-xs text-parchment-500">{currentXP} / {xpForNextLevel} XP</p>
              </div>
              <div className="relative">
                <ProgressRing progress={levelProgress} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gold-400">{user.level || 1}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current Level"
          value={user?.level || 1}
          icon="⭐"
          color="border-gold-500"
        />
        <StatCard
          title="Gold Coins"
          value={user?.goldCoins || 0}
          icon="🪙"
          color="border-yellow-600"
        />
        <StatCard
          title="Heroes Online"
          value={onlineUsers}
          icon="🧙‍♂️"
          color="border-blue-500"
        />
        <StatCard
          title="Quests Available"
          value={questCount || recentQuests.length}
          icon="📜"
          color="border-red-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column - Quests & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Quests */}
          <motion.div
            className="dungeon-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-cinzel text-gold-400">Recommended Quests</h2>
              <Link to="/quests" className="text-sm text-mana-400 hover:text-mana-300">View All →</Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-parchment-400">Loading quests...</div>
              ) : recentQuests.length > 0 ? (
                recentQuests.map((quest) => (
                  <Link
                    key={quest._id}
                    to="/quests"
                    className="block p-4 bg-dungeon-900/50 rounded-lg border border-dungeon-700 hover:border-gold-500/50 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${quest.difficulty === 'Legendary' ? 'bg-red-900/30 text-red-400' :
                              quest.difficulty === 'Veteran' ? 'bg-orange-900/30 text-orange-400' :
                                'bg-green-900/30 text-green-400'
                            }`}>
                            {quest.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold text-parchment-200 group-hover:text-gold-400 transition-colors">
                          {quest.title}
                        </h3>
                        <p className="text-sm text-parchment-500">{quest.guild || quest.company} • {quest.location || 'Remote'}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-dungeon-800 text-xs text-gold-500 rounded border border-dungeon-600">
                          {quest.rewards?.xp || 0} XP
                        </span>
                        <p className="text-sm text-gold-400 mt-1">{quest.rewards?.gold || '$0'}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-parchment-400 mb-4">No quests available yet.</p>
                  <Link to="/quests">
                    <Button variant="gold" size="sm">Explore Quest Board</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { to: '/quests', icon: '📜', label: 'Quest Board', color: 'from-gold-900/30' },
              { to: '/oracle', icon: '🔮', label: 'The Oracle', color: 'from-mystic-900/30' },
              { to: '/bounties', icon: '⚔️', label: 'Bounties', color: 'from-red-900/30' },
              { to: '/character', icon: '📋', label: 'My Profile', color: 'from-blue-900/30' },
            ].map((item) => (
              <Link key={item.to} to={item.to}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${item.color} to-dungeon-800 p-4 rounded-lg border border-dungeon-700 hover:border-gold-500/30 text-center transition-all`}
                >
                  <span className="text-3xl block mb-2">{item.icon}</span>
                  <span className="text-sm text-parchment-200">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Right Column - Profile & Info */}
        <div className="space-y-6">
          {/* Profile Completion */}
          {user && (
            <motion.div
              className="dungeon-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-cinzel text-parchment-200 mb-4">Profile Strength</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <ProgressRing progress={profileCompletion} size={60} strokeWidth={6} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gold-400">{profileCompletion}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-parchment-200 font-medium">
                    {profileCompletion < 50 ? 'Novice Profile' :
                      profileCompletion < 80 ? 'Growing Profile' : 'Legendary Profile'}
                  </p>
                  <p className="text-xs text-parchment-500">
                    {profileCompletion < 100 ? 'Complete your profile to stand out!' : 'Your profile is complete!'}
                  </p>
                </div>
              </div>
              {profileCompletion < 100 && (
                <Link to="/character">
                  <Button variant="gold" size="sm" className="w-full">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            className="dungeon-card bg-gradient-to-br from-dungeon-800 to-dungeon-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-cinzel text-gold-400 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/quests">
                <Button variant="gold" className="w-full py-3 flex flex-col gap-1" size="sm">
                  <span className="text-xl">🎯</span>
                  <span className="text-xs">Find Work</span>
                </Button>
              </Link>
              <Link to="/guilds">
                <Button variant="stone" className="w-full py-3 flex flex-col gap-1" size="sm">
                  <span className="text-xl">🛡️</span>
                  <span className="text-xs">Join Guild</span>
                </Button>
              </Link>
              <Link to="/summoning">
                <Button variant="mystic" className="w-full py-3 flex flex-col gap-1" size="sm">
                  <span className="text-xl">🔮</span>
                  <span className="text-xs">Find Mentor</span>
                </Button>
              </Link>
              <Link to="/barter">
                <Button variant="ghost" className="w-full py-3 flex flex-col gap-1 border border-dungeon-600" size="sm">
                  <span className="text-xl">🔄</span>
                  <span className="text-xs">Skill Barter</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Allies Online */}
          <motion.div
            className="dungeon-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg font-cinzel text-parchment-200 mb-4">Allies Online</h2>
            {user?.friends?.length > 0 ? (
              <div className="space-y-2">
                {user.friends.slice(0, 5).map(friend => (
                  <div key={friend._id} className="flex items-center gap-2 text-sm text-parchment-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {friend.heroName}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-parchment-500 mb-3">You have no allies yet.</p>
                <Link to="/guilds">
                  <Button variant="ghost" size="sm">Find Allies</Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Daily Prophecy */}
          <motion.div
            className="dungeon-card border-mystic-500/30 bg-gradient-to-br from-mystic-900/20 to-dungeon-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-lg font-cinzel text-mystic-400 mb-3 flex items-center gap-2">
              <span>✨</span> Daily Prophecy
            </h2>
            <p className="text-parchment-300 italic text-sm leading-relaxed">
              "{todaysProphecy}"
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
