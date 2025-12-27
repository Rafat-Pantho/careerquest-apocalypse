import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CreateBountyForm from '../components/forms/CreateBountyForm';
import { useAuth } from '../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Bounty difficulty colors and badges
const difficultyConfig = {
  'Easy': { color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-500/50', icon: '🌱' },
  'Medium': { color: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-500/50', icon: '⚔️' },
  'Hard': { color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-500/50', icon: '🔥' },
  'Legendary': { color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500/50', icon: '💀' }
};

const BountyCard = ({ bounty, onAccept, onViewDetails }) => {
  const difficulty = difficultyConfig[bounty.difficulty] || difficultyConfig['Medium'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dungeon-card hover:border-gold-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${difficulty.bg} ${difficulty.color} border ${difficulty.border}`}>
              {difficulty.icon} {bounty.difficulty || 'Medium'}
            </span>
            <span className="px-2 py-1 bg-dungeon-900 rounded text-xs text-parchment-400 border border-dungeon-700">
              {bounty.subject}
            </span>
          </div>
          <h3 className="text-xl font-bold text-parchment-100 mb-1">{bounty.title}</h3>
          <p className="text-sm text-parchment-500">Grade Level: {bounty.gradeLevel}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gold-400">{bounty.reward?.amount || 0}</div>
          <div className="text-xs text-gold-600">{bounty.reward?.currency || 'Gold'}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-parchment-300 text-sm mb-4 line-clamp-2">
        {bounty.description}
      </p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        {bounty.sessions && (
          <div className="bg-dungeon-900/50 p-2 rounded">
            <p className="text-parchment-500 text-xs">Sessions</p>
            <p className="text-parchment-200">{bounty.sessions}</p>
          </div>
        )}
        {bounty.duration && (
          <div className="bg-dungeon-900/50 p-2 rounded">
            <p className="text-parchment-500 text-xs">Duration</p>
            <p className="text-parchment-200">{bounty.duration}</p>
          </div>
        )}
      </div>

      {/* Poster Info */}
      {bounty.postedBy && (
        <div className="flex items-center gap-2 mb-4 pt-4 border-t border-dungeon-700">
          <div className="w-8 h-8 rounded-full bg-dungeon-700 overflow-hidden border border-dungeon-600">
            <img 
              src={bounty.postedBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${bounty.postedBy.heroName}`} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-parchment-200">{bounty.postedBy.heroName}</p>
            <p className="text-xs text-parchment-500">Posted {new Date(bounty.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-parchment-500">{bounty.applicants?.length || 0} hunters</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => onViewDetails(bounty)}>
          View Details
        </Button>
        <Button variant="stone" size="sm" className="flex-1" onClick={() => onAccept(bounty._id)}>
          Accept Contract
        </Button>
      </div>
    </motion.div>
  );
};

const BountyDetailModal = ({ bounty, onClose, onAccept, loading }) => {
  const [message, setMessage] = useState('');
  const difficulty = difficultyConfig[bounty?.difficulty] || difficultyConfig['Medium'];

  if (!bounty) return null;

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded text-sm font-bold ${difficulty.bg} ${difficulty.color} border ${difficulty.border}`}>
            {difficulty.icon} {bounty.difficulty || 'Medium'}
          </span>
          <span className="px-3 py-1 bg-dungeon-900 rounded text-sm text-parchment-400 border border-dungeon-700">
            {bounty.subject}
          </span>
        </div>
        <h2 className="text-2xl font-cinzel text-gold-400 mb-2">{bounty.title}</h2>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-3xl font-bold text-gold-400">{bounty.reward?.amount || 0}</span>
            <span className="text-gold-600 ml-1">{bounty.reward?.currency || 'Gold'}</span>
          </div>
          <div className="text-parchment-400">•</div>
          <div className="text-parchment-400">Grade: {bounty.gradeLevel}</div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-parchment-200 mb-2">Mission Briefing</h3>
        <p className="text-parchment-300">{bounty.description}</p>
      </div>

      {/* Requirements */}
      {bounty.requirements && bounty.requirements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-parchment-200 mb-2">Requirements</h3>
          <ul className="space-y-1">
            {bounty.requirements.map((req, i) => (
              <li key={i} className="text-parchment-300 flex items-center gap-2">
                <span className="text-gold-500">•</span> {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {bounty.sessions && (
          <div className="bg-dungeon-900/50 p-3 rounded-lg">
            <p className="text-parchment-500 text-sm">Sessions Required</p>
            <p className="text-xl text-parchment-100">{bounty.sessions}</p>
          </div>
        )}
        {bounty.duration && (
          <div className="bg-dungeon-900/50 p-3 rounded-lg">
            <p className="text-parchment-500 text-sm">Duration per Session</p>
            <p className="text-xl text-parchment-100">{bounty.duration}</p>
          </div>
        )}
        {bounty.deadline && (
          <div className="bg-dungeon-900/50 p-3 rounded-lg col-span-2">
            <p className="text-parchment-500 text-sm">Deadline</p>
            <p className="text-xl text-parchment-100">{new Date(bounty.deadline).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Poster */}
      {bounty.postedBy && (
        <div className="flex items-center gap-3 p-4 bg-dungeon-900/30 rounded-lg mb-6">
          <div className="w-12 h-12 rounded-full bg-dungeon-700 overflow-hidden border-2 border-gold-500">
            <img 
              src={bounty.postedBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${bounty.postedBy.heroName}`} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="font-medium text-parchment-100">{bounty.postedBy.heroName}</p>
            <p className="text-sm text-parchment-500">{bounty.postedBy.heroClass}</p>
          </div>
        </div>
      )}

      {/* Application */}
      <div className="mb-6">
        <label className="block text-parchment-300 text-sm mb-2">Your Message (Optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I am well-versed in this arcane art and ready to assist..."
          className="w-full h-24 bg-dungeon-900 border border-dungeon-600 rounded-lg p-3 text-parchment-100 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button 
          variant="gold" 
          onClick={() => onAccept(bounty._id, message)}
          loading={loading}
          className="flex-1"
        >
          ⚔️ Accept Contract
        </Button>
      </div>
    </div>
  );
};

const MercenaryGuildPage = () => {
  const { token } = useAuth();
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [applying, setApplying] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBounties = async () => {
    try {
      const response = await axios.get(`${API_URL}/bounties`);
      setBounties(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  const handleBountyCreated = () => {
    setIsCreateModalOpen(false);
    fetchBounties();
  };

  const handleAccept = async (bountyId, message = '') => {
    if (!token) {
      alert('You must be logged in to accept bounties!');
      return;
    }

    setApplying(true);
    try {
      await axios.post(
        `${API_URL}/bounties/${bountyId}/apply`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedBounty(null);
      alert('Contract accepted! The patron has been notified.');
      fetchBounties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept bounty');
    } finally {
      setApplying(false);
    }
  };

  const filteredBounties = bounties.filter(bounty => {
    if (filter === 'all') return true;
    if (filter === 'easy') return bounty.difficulty === 'Easy';
    if (filter === 'medium') return bounty.difficulty === 'Medium';
    if (filter === 'hard') return bounty.difficulty === 'Hard';
    if (filter === 'legendary') return bounty.difficulty === 'Legendary';
    return true;
  });

  const filters = [
    { id: 'all', label: 'All Bounties' },
    { id: 'easy', label: '🌱 Easy' },
    { id: 'medium', label: '⚔️ Medium' },
    { id: 'hard', label: '🔥 Hard' },
    { id: 'legendary', label: '💀 Legendary' }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Mercenary Guild</h1>
          <p className="text-parchment-300">Earn gold by slaying academic beasts. Tutoring bounties await!</p>
        </div>
        <Button variant="stone" leftIcon={<span>📜</span>} onClick={() => setIsCreateModalOpen(true)}>
          Post Bounty
        </Button>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div 
          className="bg-gradient-to-br from-gold-900/30 to-dungeon-800 p-4 rounded-lg border border-gold-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gold-400 text-sm">Active Bounties</p>
          <p className="text-3xl font-bold text-parchment-100">{bounties.length}</p>
        </motion.div>
        <motion.div 
          className="bg-gradient-to-br from-green-900/30 to-dungeon-800 p-4 rounded-lg border border-green-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-green-400 text-sm">Easy Missions</p>
          <p className="text-3xl font-bold text-parchment-100">
            {bounties.filter(b => b.difficulty === 'Easy').length}
          </p>
        </motion.div>
        <motion.div 
          className="bg-gradient-to-br from-orange-900/30 to-dungeon-800 p-4 rounded-lg border border-orange-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-orange-400 text-sm">Hard Missions</p>
          <p className="text-3xl font-bold text-parchment-100">
            {bounties.filter(b => b.difficulty === 'Hard' || b.difficulty === 'Legendary').length}
          </p>
        </motion.div>
        <motion.div 
          className="bg-gradient-to-br from-mystic-900/30 to-dungeon-800 p-4 rounded-lg border border-mystic-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-mystic-400 text-sm">Total Rewards</p>
          <p className="text-3xl font-bold text-parchment-100">
            {bounties.reduce((sum, b) => sum + (b.reward?.amount || 0), 0)}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button 
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${filter === f.id 
                ? 'bg-gold-500 text-dungeon-900' 
                : 'bg-dungeon-800 text-parchment-400 hover:bg-dungeon-700'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post a New Bounty"
      >
        <CreateBountyForm 
          onSuccess={handleBountyCreated}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedBounty}
        onClose={() => setSelectedBounty(null)}
        title=""
        size="lg"
      >
        <BountyDetailModal 
          bounty={selectedBounty}
          onClose={() => setSelectedBounty(null)}
          onAccept={handleAccept}
          loading={applying}
        />
      </Modal>

      {/* Bounty Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-parchment-400">Loading bounties...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBounties.map(bounty => (
              <BountyCard 
                key={bounty._id} 
                bounty={bounty}
                onAccept={(id) => handleAccept(id)}
                onViewDetails={setSelectedBounty}
              />
            ))}
          </AnimatePresence>
          
          {filteredBounties.length === 0 && (
            <div className="col-span-full text-center py-12 bg-dungeon-800/30 rounded-lg border border-dashed border-dungeon-600">
              <p className="text-parchment-400 mb-4">
                {filter !== 'all' ? 'No bounties match this filter.' : 'The guild hall is empty.'}
              </p>
              {filter !== 'all' ? (
                <Button variant="ghost" onClick={() => setFilter('all')}>Show All Bounties</Button>
              ) : (
                <Button variant="stone" onClick={() => setIsCreateModalOpen(true)}>Post the First Bounty</Button>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MercenaryGuildPage;
