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
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const quotes = [
  "The bug you seek is not in the code, but in the requirements.",
  "A thousand lines of code begin with a single function.",
  "The best error message is the one that never shows up.",
  "Those who master recursion shall understand recursion.",
  "First, make it work. Then, make it right. Then, make it fast.",
];

const StatCard = ({ title, value, icon, trend, subtext }) => (
  <div className="card p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
      </div>
      <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
        <span className="text-xl">{icon}</span>
      </div>
    </div>
    {trend && (
      <div className="flex items-center text-sm">
        <span className={`font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="text-gray-500 ml-2">vs last week</span>
      </div>
    )}
    {subtext && <p className="text-gray-500 text-sm">{subtext}</p>}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { onlineUsers, questCount } = useSocket();
  const greeting = getGreeting();

  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todaysQuote] = useState(quotes[new Date().getDate() % quotes.length]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const jobsRes = await axios.get(`${API_URL}/quests`);
        setRecentJobs(jobsRes.data.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const xpForNextLevel = (user?.level || 1) * 1000;
  const currentXP = user?.experience || 0;
  const levelProgress = Math.min(100, (currentXP / xpForNextLevel) * 100);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {greeting}, {user?.heroName || 'User'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's what's happening with your career today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/character">
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link to="/quests">
            <Button variant="primary">Find Jobs</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current Level"
          value={user?.level || 1}
          icon="⭐"
          subtext={`${currentXP} / ${xpForNextLevel} XP`}
        />
        <StatCard
          title="Total Credits"
          value={user?.goldCoins || 0}
          icon="💳"
          trend={12}
        />
        <StatCard
          title="Active Users"
          value={onlineUsers}
          icon="👥"
          subtext="Networking now"
        />
        <StatCard
          title="Open Roles"
          value={questCount || recentJobs.length}
          icon="💼"
          subtext="New opportunities"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column - Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recommended Jobs</h2>
              <Link to="/quests" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading jobs...</div>
              ) : recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${job.difficulty === 'Legendary' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              job.difficulty === 'Veteran' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                            {job.difficulty}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.guild || job.company} • {job.location || 'Remote'}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded">
                          {job.rewards?.xp || 0} XP
                        </span>
                        <p className="text-sm font-medium text-primary-600 mt-1">{job.rewards?.gold || '$0'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link to={`/quests`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No jobs available yet.</p>
                  <Link to="/quests">
                    <Button variant="primary" size="sm">Explore Jobs</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Daily Insight */}
          <div className="card p-6 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-800 border-primary-100 dark:border-gray-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary-600 mb-3 flex items-center gap-2">
              <span>💡</span> Daily Insight
            </h3>
            <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">
              "{todaysQuote}"
            </p>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/character" className="block">
                <Button variant="outline" fullWidth className="justify-start">
                  <span className="mr-2">👤</span> Update Profile
                </Button>
              </Link>
              <Link to="/guilds" className="block">
                <Button variant="outline" fullWidth className="justify-start">
                  <span className="mr-2">🛡️</span> Join Community
                </Button>
              </Link>
              <Link to="/summoning" className="block">
                <Button variant="outline" fullWidth className="justify-start">
                  <span className="mr-2">🎓</span> Find Mentor
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Progress */}
          <div className="card p-6">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Level Progress</h3>
              <span className="text-primary-600 font-bold">{Math.round(levelProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {xpForNextLevel - currentXP} XP until Level {(user?.level || 1) + 1}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
