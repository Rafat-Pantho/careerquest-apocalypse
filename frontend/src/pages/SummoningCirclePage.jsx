import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Summoning Circle Animation Component
const SummoningCircle = ({ active }) => (
  <div className="relative w-48 h-48 mx-auto mb-8">
    {/* Outer ring */}
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-mystic-500/50"
      animate={{ rotate: active ? 360 : 0 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    {/* Middle ring */}
    <motion.div
      className="absolute inset-4 rounded-full border-2 border-mystic-400/40"
      animate={{ rotate: active ? -360 : 0 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    {/* Inner ring with runes */}
    <motion.div
      className="absolute inset-8 rounded-full border-2 border-mystic-300/30"
      animate={{ rotate: active ? 360 : 0 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
    {/* Center glow */}
    <motion.div
      className="absolute inset-16 rounded-full bg-gradient-to-r from-mystic-600 to-purple-600"
      animate={{ 
        scale: active ? [1, 1.2, 1] : 1,
        opacity: active ? [0.5, 0.8, 0.5] : 0.3
      }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Rune symbols */}
    {['ᚠ', 'ᚱ', 'ᚦ', 'ᚨ', 'ᚲ', 'ᚷ'].map((rune, i) => (
      <motion.span
        key={i}
        className="absolute text-mystic-400 text-lg font-bold"
        style={{
          top: '50%',
          left: '50%',
          transform: `rotate(${i * 60}deg) translateY(-80px)`
        }}
        animate={{ opacity: active ? [0.3, 1, 0.3] : 0.3 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
      >
        {rune}
      </motion.span>
    ))}
  </div>
);

// Elder Card Component
const ElderCard = ({ elder, onSummon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="dungeon-card hover:border-mystic-500/50 transition-all"
  >
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 rounded-full bg-dungeon-700 overflow-hidden border-2 border-mystic-500 flex-shrink-0">
        <img 
          src={elder.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${elder.heroName}`} 
          alt={elder.heroName} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-parchment-100">{elder.heroName}</h3>
        <p className="text-mystic-400 text-sm">{elder.heroClass}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-parchment-500">⚔️ {elder.skillCount} skills</span>
          <span className="text-xs text-parchment-500">•</span>
          <span className="text-xs text-parchment-500">📜 {elder.experienceYears}+ years</span>
        </div>
      </div>
    </div>

    {elder.heroicSummary && (
      <p className="text-parchment-400 text-sm mb-4 line-clamp-2">{elder.heroicSummary}</p>
    )}

    {elder.specialties?.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-4">
        {elder.specialties.map((skill, i) => (
          <span key={i} className="px-2 py-0.5 bg-mystic-900/30 text-mystic-300 text-xs rounded-full border border-mystic-600/30">
            {skill}
          </span>
        ))}
      </div>
    )}

    <Button 
      variant="mystic" 
      className="w-full"
      onClick={() => onSummon(elder)}
    >
      🔮 Summon Elder
    </Button>
  </motion.div>
);

// Ritual Card (Active Mentorships)
const RitualCard = ({ ritual, currentUserId, onRespond, onComplete }) => {
  const isElder = ritual.elder?._id === currentUserId;
  const _isSummoner = ritual.summoner?._id === currentUserId; // Prefixed to indicate intentionally unused
  
  const statusColors = {
    'Pending': 'text-amber-400 bg-amber-900/30 border-amber-500/30',
    'Active': 'text-green-400 bg-green-900/30 border-green-500/30',
    'Completed': 'text-blue-400 bg-blue-900/30 border-blue-500/30',
    'Rejected': 'text-red-400 bg-red-900/30 border-red-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="dungeon-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-dungeon-700 overflow-hidden border-2 border-dungeon-600">
            <img 
              src={(isElder ? ritual.summoner?.avatar : ritual.elder?.avatar) || 
                   `https://api.dicebear.com/7.x/avataaars/svg?seed=${isElder ? ritual.summoner?.heroName : ritual.elder?.heroName}`} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="text-parchment-100 font-medium">
              {isElder ? ritual.summoner?.heroName : ritual.elder?.heroName}
            </p>
            <p className="text-xs text-parchment-500">
              {isElder ? 'Seeks your wisdom' : 'Your mentor'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[ritual.status]}`}>
          {ritual.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-mystic-300 mb-1">Topic: {ritual.topic}</p>
        <p className="text-sm text-parchment-400 italic">"{ritual.incantation}"</p>
      </div>

      {ritual.responseMessage && (
        <div className="bg-dungeon-900/50 p-3 rounded-lg mb-4">
          <p className="text-xs text-parchment-500">Elder's Response:</p>
          <p className="text-sm text-parchment-300">{ritual.responseMessage}</p>
        </div>
      )}

      {/* Actions for Elder on Pending requests */}
      {isElder && ritual.status === 'Pending' && (
        <div className="flex gap-2">
          <Button 
            variant="danger" 
            size="sm" 
            className="flex-1"
            onClick={() => onRespond(ritual._id, 'Rejected')}
          >
            Decline
          </Button>
          <Button 
            variant="mystic" 
            size="sm" 
            className="flex-1"
            onClick={() => onRespond(ritual._id, 'Active')}
          >
            Accept
          </Button>
        </div>
      )}

      {/* Complete button for active mentorships */}
      {ritual.status === 'Active' && (
        <Button 
          variant="gold" 
          size="sm" 
          className="w-full"
          onClick={() => onComplete(ritual._id)}
        >
          Mark Complete
        </Button>
      )}

      <p className="text-xs text-parchment-500 mt-3">
        {new Date(ritual.createdAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
};

// Summon Modal Form
const SummonForm = ({ elder, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    topic: '',
    incantation: '',
    goals: ['']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      elderId: elder._id,
      topic: formData.topic,
      incantation: formData.incantation,
      goals: formData.goals.filter(g => g.trim())
    });
  };

  const addGoal = () => {
    setFormData({ ...formData, goals: [...formData.goals, ''] });
  };

  const updateGoal = (index, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-dungeon-700 overflow-hidden border-2 border-mystic-500 mb-3">
          <img 
            src={elder.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${elder.heroName}`} 
            alt={elder.heroName} 
            className="w-full h-full object-cover" 
          />
        </div>
        <h3 className="text-xl font-cinzel text-mystic-300">{elder.heroName}</h3>
        <p className="text-sm text-parchment-400">{elder.heroClass}</p>
      </div>

      <div className="mb-4">
        <label className="block text-parchment-300 text-sm mb-2">Topic of Guidance</label>
        <select
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded-lg p-3 text-parchment-100"
          required
        >
          <option value="">Select a topic...</option>
          <option value="Career Path">Career Path Guidance</option>
          <option value="Technical Skills">Technical Skill Development</option>
          <option value="Interview Prep">Interview Preparation</option>
          <option value="Resume Review">Resume/CV Review</option>
          <option value="Networking">Networking & Connections</option>
          <option value="Industry Insights">Industry Insights</option>
          <option value="Project Review">Project/Portfolio Review</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-parchment-300 text-sm mb-2">Your Incantation (Message)</label>
        <textarea
          value={formData.incantation}
          onChange={(e) => setFormData({ ...formData, incantation: e.target.value })}
          placeholder="Oh wise Elder, I seek your guidance on..."
          className="w-full h-24 bg-dungeon-900 border border-dungeon-600 rounded-lg p-3 text-parchment-100 resize-none"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-parchment-300 text-sm mb-2">Your Goals (Optional)</label>
        {formData.goals.map((goal, i) => (
          <input
            key={i}
            type="text"
            value={goal}
            onChange={(e) => updateGoal(i, e.target.value)}
            placeholder={`Goal ${i + 1}`}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded-lg p-2 text-parchment-100 text-sm mb-2"
          />
        ))}
        {formData.goals.length < 5 && (
          <button
            type="button"
            onClick={addGoal}
            className="text-sm text-mystic-400 hover:text-mystic-300"
          >
            + Add another goal
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="mystic" type="submit" loading={loading} className="flex-1">
          🔮 Begin Ritual
        </Button>
      </div>
    </form>
  );
};

const SummoningCirclePage = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('elders');
  const [elders, setElders] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElder, setSelectedElder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [becomingElder, setBecomingElder] = useState(false);

  const fetchMyRituals = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/mentorship/my-rituals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRituals(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchElders();
    if (token) {
      fetchMyRituals();
    }
  }, [token, fetchMyRituals]);

  const fetchElders = async () => {
    try {
      const response = await axios.get(`${API_URL}/mentorship/elders`);
      setElders(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummon = async (data) => {
    if (!token) {
      alert('You must be logged in to summon an Elder!');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/mentorship/summon`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedElder(null);
      fetchMyRituals();
      alert('The summoning ritual has begun! The Elder will respond soon.');
    } catch (err) {
      alert(err.response?.data?.message || 'The ritual failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (ritualId, status) => {
    try {
      await axios.put(
        `${API_URL}/mentorship/${ritualId}/respond`,
        { status, message: status === 'Active' ? 'I accept your summons.' : 'I cannot assist at this time.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyRituals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond.');
    }
  };

  const handleComplete = async (ritualId) => {
    try {
      await axios.put(
        `${API_URL}/mentorship/${ritualId}/complete`,
        { feedback: 'Completed successfully' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyRituals();
      alert('The ritual has been marked complete!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete.');
    }
  };

  const handleBecomeElder = async () => {
    setBecomingElder(true);
    try {
      await axios.post(
        `${API_URL}/mentorship/become-elder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('You have ascended to Elder status! Refresh to see your new role.');
    } catch (err) {
      alert(err.response?.data?.message || 'The ascension ritual failed.');
    } finally {
      setBecomingElder(false);
    }
  };

  const tabs = [
    { id: 'elders', label: 'Available Elders', icon: '👤' },
    { id: 'rituals', label: 'My Rituals', icon: '📜', requiresAuth: true }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-cinzel text-mystic-400 mb-2">Summoning Circle</h1>
        <p className="text-parchment-400">Call upon the Elders for wisdom and guidance</p>
      </div>

      {/* Animated Circle */}
      <SummoningCircle active={!!selectedElder} />

      {/* Become Elder Button */}
      {token && user?.role !== 'elder' && (
        <div className="text-center mb-8">
          <Button 
            variant="mystic" 
            onClick={handleBecomeElder}
            loading={becomingElder}
          >
            ⬆️ Ascend to Elder Status
          </Button>
          <p className="text-xs text-parchment-500 mt-2">
            Requires: 3+ skills and 1+ experience entry
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          (!tab.requiresAuth || token) && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-mystic-600 text-white shadow-lg shadow-mystic-600/30'
                  : 'bg-dungeon-700 text-parchment-300 hover:bg-dungeon-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'rituals' && rituals.filter(r => r.status === 'Pending').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500 text-dungeon-900 text-xs rounded-full">
                  {rituals.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>
          )
        ))}
      </div>

      {/* Summon Modal */}
      <Modal
        isOpen={!!selectedElder}
        onClose={() => setSelectedElder(null)}
        title="Perform Summoning Ritual"
      >
        {selectedElder && (
          <SummonForm 
            elder={selectedElder}
            onSubmit={handleSummon}
            onCancel={() => setSelectedElder(null)}
            loading={submitting}
          />
        )}
      </Modal>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'elders' && (
          <motion.div
            key="elders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-4xl mb-4">🔮</div>
                <p className="text-parchment-400">Scanning for magical signatures...</p>
              </div>
            ) : elders.length === 0 ? (
              <div className="text-center py-12 bg-dungeon-800/30 rounded-lg border border-dashed border-dungeon-600">
                <p className="text-parchment-400 mb-4">No Elders are currently available.</p>
                <p className="text-sm text-parchment-500">Be the first to ascend!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elders.map(elder => (
                  <ElderCard 
                    key={elder._id} 
                    elder={elder} 
                    onSummon={setSelectedElder}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'rituals' && token && (
          <motion.div
            key="rituals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {rituals.length === 0 ? (
              <div className="text-center py-12 bg-dungeon-800/30 rounded-lg border border-dashed border-dungeon-600">
                <p className="text-parchment-400 mb-4">You have no active rituals.</p>
                <Button variant="mystic" onClick={() => setActiveTab('elders')}>
                  Find an Elder
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Section */}
                {rituals.filter(r => r.status === 'Pending').length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-cinzel text-amber-400 mb-4">⏳ Pending Rituals</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {rituals.filter(r => r.status === 'Pending').map(ritual => (
                        <RitualCard 
                          key={ritual._id} 
                          ritual={ritual}
                          currentUserId={user?._id}
                          onRespond={handleRespond}
                          onComplete={handleComplete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Section */}
                {rituals.filter(r => r.status === 'Active').length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-cinzel text-green-400 mb-4">✨ Active Bonds</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {rituals.filter(r => r.status === 'Active').map(ritual => (
                        <RitualCard 
                          key={ritual._id} 
                          ritual={ritual}
                          currentUserId={user?._id}
                          onRespond={handleRespond}
                          onComplete={handleComplete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Section */}
                {rituals.filter(r => r.status === 'Completed').length > 0 && (
                  <div>
                    <h2 className="text-lg font-cinzel text-blue-400 mb-4">📜 Completed Rituals</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {rituals.filter(r => r.status === 'Completed').map(ritual => (
                        <RitualCard 
                          key={ritual._id} 
                          ritual={ritual}
                          currentUserId={user?._id}
                          onRespond={handleRespond}
                          onComplete={handleComplete}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SummoningCirclePage;
