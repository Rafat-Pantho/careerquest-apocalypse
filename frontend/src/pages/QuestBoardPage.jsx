import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CreateQuestForm from '../components/forms/CreateQuestForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SurvivalMeter = ({ probability, size = 'md' }) => {
  const getColor = () => {
    if (probability >= 70) return 'from-green-500 to-green-600';
    if (probability >= 50) return 'from-amber-500 to-amber-600';
    if (probability >= 30) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getRiskLabel = () => {
    if (probability >= 70) return { text: 'Low Risk', color: 'text-green-400' };
    if (probability >= 50) return { text: 'Medium Risk', color: 'text-amber-400' };
    if (probability >= 30) return { text: 'High Risk', color: 'text-orange-400' };
    return { text: 'Critical', color: 'text-red-400' };
  };

  const risk = getRiskLabel();
  const sizeClasses = size === 'lg' ? 'h-4' : 'h-2';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-medium ${risk.color}`}>{risk.text}</span>
        <span className="text-xs text-parchment-400">{probability}%</span>
      </div>
      <div className={`w-full bg-dungeon-900 rounded-full ${sizeClasses} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
        />
      </div>
    </div>
  );
};

const QuestCard = ({ quest, onClick, showProbability }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="dungeon-card hover:border-gold-500/50 transition-all group cursor-pointer"
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className={`
          inline-block px-2 py-1 rounded text-xs font-bold mb-2 border
          ${quest.difficulty === 'Legendary' ? 'bg-red-900/30 text-red-400 border-red-500/50' :
            quest.difficulty === 'Veteran' ? 'bg-orange-900/30 text-orange-400 border-orange-500/50' :
              'bg-green-900/30 text-green-400 border-green-500/50'}
        `}>
          {quest.difficulty}
        </span>
        <h3 className="text-xl font-bold text-parchment-100 group-hover:text-gold-400 transition-colors">
          {quest.title}
        </h3>
        <p className="text-gold-600 text-sm">{quest.guild || quest.company}</p>
      </div>
      <div className="text-right">
        <div className="text-gold-400 font-bold">{quest.rewards?.gold || '$0'}</div>
        <div className="text-xs text-parchment-500">{quest.rewards?.xp || 0} XP</div>
      </div>
    </div>

    <p className="text-parchment-300 text-sm mb-4 line-clamp-2">
      {quest.description}
    </p>

    {showProbability && quest.survivalProbability !== undefined && (
      <div className="mb-4 p-3 bg-dungeon-900/50 rounded-lg">
        <p className="text-xs text-parchment-400 mb-2">⚔️ Survival Probability</p>
        <SurvivalMeter probability={quest.survivalProbability} />
      </div>
    )}

    <div className="flex flex-wrap gap-2 mb-6">
      {quest.requirements?.slice(0, 3).map((req, i) => (
        <span key={i} className="px-2 py-1 bg-dungeon-900 rounded text-xs text-parchment-400 border border-dungeon-700">
          {req}
        </span>
      ))}
      {quest.requirements?.length > 3 && (
        <span className="px-2 py-1 text-xs text-parchment-500">+{quest.requirements.length - 3} more</span>
      )}
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-dungeon-700">
      <span className="text-xs text-parchment-500">
        Posted {new Date(quest.createdAt).toLocaleDateString()}
      </span>
      <Button size="sm" variant="gold" onClick={(e) => { e.stopPropagation(); onClick(); }}>
        View Quest
      </Button>
    </div>
  </motion.div>
);

const QuestDetailModal = ({ quest, onClose, onApply, loading, token }) => {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const calculateDetailedProbability = async () => {
    if (!token) return;
    setAnalyzing(true);
    try {
      const response = await axios.post(
        `${API_URL}/quests/${quest._id}/survival-probability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(response.data.data.analysis);
    } catch (err) {
      console.error('Failed to calculate probability:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <span className={`
            inline-block px-3 py-1 rounded text-sm font-bold border
            ${quest.difficulty === 'Legendary' ? 'bg-red-900/30 text-red-400 border-red-500/50' :
              quest.difficulty === 'Veteran' ? 'bg-orange-900/30 text-orange-400 border-orange-500/50' :
                'bg-green-900/30 text-green-400 border-green-500/50'}
          `}>
            {quest.difficulty}
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold-400">{quest.rewards?.gold || '$0'}</div>
            <div className="text-sm text-parchment-500">{quest.rewards?.xp || 0} XP</div>
          </div>
        </div>
        <h2 className="text-2xl font-cinzel text-parchment-100">{quest.title}</h2>
        <p className="text-gold-500">{quest.guild || quest.company}</p>
        {quest.location && <p className="text-parchment-400 text-sm">📍 {quest.location}</p>}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-parchment-200 mb-2">Quest Details</h3>
        <p className="text-parchment-300">{quest.description}</p>
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-parchment-200 mb-2">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {quest.requirements?.map((req, i) => (
            <span key={i} className="px-3 py-1 bg-dungeon-900 rounded-lg text-sm text-parchment-300 border border-dungeon-600">
              {req}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Survival Probability */}
      {quest.survivalProbability !== undefined && (
        <div className="mb-6 p-4 bg-dungeon-900/50 rounded-lg border border-dungeon-600">
          <h3 className="text-lg font-medium text-parchment-200 mb-3">⚔️ Your Survival Probability</h3>
          <SurvivalMeter probability={quest.survivalProbability} size="lg" />
        </div>
      )}

      {/* Detailed Analysis */}
      {token && (
        <div className="mb-6">
          {!analysis ? (
            <Button
              variant="mystic"
              onClick={calculateDetailedProbability}
              loading={analyzing}
              className="w-full"
            >
              🔮 Get Detailed Analysis
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-mystic-900/20 border border-mystic-600/30 rounded-lg"
            >
              <h3 className="text-lg font-cinzel text-mystic-300 mb-4">Oracle's Analysis</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-dungeon-900 rounded-lg">
                  <p className="text-xs text-parchment-400">Survival Chance</p>
                  <p className="text-3xl font-bold text-gold-400">{analysis.survivalProbability}%</p>
                </div>
                <div className="text-center p-3 bg-dungeon-900 rounded-lg">
                  <p className="text-xs text-parchment-400">Risk Level</p>
                  <p className={`text-2xl font-bold ${analysis.riskLevel === 'Low' ? 'text-green-400' :
                      analysis.riskLevel === 'Medium' ? 'text-amber-400' :
                        analysis.riskLevel === 'High' ? 'text-orange-400' : 'text-red-400'
                    }`}>{analysis.riskLevel}</p>
                </div>
              </div>

              {analysis.matchingSkills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-green-400 mb-1">✅ Matching Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.matchingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-900/30 text-green-300 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.missingSkills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-red-400 mb-1">❌ Skills to Develop</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.missingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-900/30 text-red-300 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-dungeon-900 rounded-lg">
                <p className="text-sm text-amber-400 mb-1">💡 Recommendation</p>
                <p className="text-parchment-300 text-sm">{analysis.recommendation}</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-dungeon-700">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button
          variant="gold"
          onClick={() => onApply(quest._id)}
          loading={loading}
          className="flex-1"
        >
          ⚔️ Accept Quest
        </Button>
      </div>
    </div>
  );
};

const QuestBoardPage = () => {
  const { socket } = useSocket();
  const { token } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [applyingTo, setApplyingTo] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showProbability, setShowProbability] = useState(false);

  const fetchQuests = useCallback(async () => {
    try {
      // If logged in and want probability, use the special endpoint
      if (token && showProbability) {
        const response = await axios.get(`${API_URL}/quests/with-probability`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuests(response.data.data);
      } else {
        const response = await axios.get(`${API_URL}/quests`);
        setQuests(response.data.data);
      }
    } catch (err) {
      setError('Failed to load quests from the guild archives.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showProbability, token]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    if (socket) {
      socket.on('newQuest', (newQuest) => {
        setQuests((prev) => [newQuest, ...prev]);
      });
    }
    return () => {
      if (socket) socket.off('newQuest');
    };
  }, [socket]);

  const handleQuestCreated = () => {
    setIsModalOpen(false);
    fetchQuests();
  };

  const handleApply = async (questId) => {
    if (!token) {
      alert('You must be logged in to accept quests!');
      return;
    }

    setApplyingTo(questId);
    try {
      await axios.post(
        `${API_URL}/quests/${questId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedQuest(null);
      alert('Application sent! May fortune favor you.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for quest');
    } finally {
      setApplyingTo(null);
    }
  };

  const filteredQuests = quests.filter(quest => {
    if (filter === 'all') return true;
    if (filter === 'high-chance' && quest.survivalProbability >= 70) return true;
    if (filter === 'legendary' && quest.difficulty === 'Legendary') return true;
    if (filter === 'veteran' && quest.difficulty === 'Veteran') return true;
    if (filter === 'recruit' && quest.difficulty === 'Recruit') return true;
    return false;
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Quest Board</h1>
          <p className="text-parchment-300">Choose your destiny, brave hero.</p>
        </div>
        <div className="flex gap-3">
          {token && (
            <Button
              variant={showProbability ? 'mystic' : 'ghost'}
              onClick={() => setShowProbability(!showProbability)}
              title="Show your survival probability for each quest"
            >
              🔮 {showProbability ? 'Showing Odds' : 'Show Odds'}
            </Button>
          )}
          <Button
            variant="stone"
            leftIcon={<span>➕</span>}
            onClick={() => setIsModalOpen(true)}
          >
            Post a Quest
          </Button>
        </div>
      </div>

      {/* Create Quest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post a New Quest"
      >
        <CreateQuestForm
          onSuccess={handleQuestCreated}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Quest Detail Modal */}
      <Modal
        isOpen={!!selectedQuest}
        onClose={() => setSelectedQuest(null)}
        title=""
        size="lg"
      >
        {selectedQuest && (
          <QuestDetailModal
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onApply={handleApply}
            loading={applyingTo === selectedQuest._id}
            token={token}
          />
        )}
      </Modal>

      {/* Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Quests' },
          { id: 'high-chance', label: '🎯 High Chance', requiresProb: true },
          { id: 'legendary', label: '🔥 Legendary' },
          { id: 'veteran', label: '⚔️ Veteran' },
          { id: 'recruit', label: '🌱 Recruit' }
        ].map((f) => (
          (!f.requiresProb || showProbability) && (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap
                ${filter === f.id
                  ? 'bg-gold-500 text-dungeon-900'
                  : 'bg-dungeon-800 text-parchment-400 hover:bg-dungeon-700'}
              `}
            >
              {f.label}
            </button>
          )
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-parchment-400">Summoning quests...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredQuests.map(quest => (
              <QuestCard
                key={quest._id}
                quest={quest}
                onClick={() => setSelectedQuest(quest)}
                showProbability={showProbability}
              />
            ))}
          </AnimatePresence>

          {filteredQuests.length === 0 && (
            <div className="col-span-full text-center py-12 bg-dungeon-800/30 rounded-lg border border-dashed border-dungeon-600">
              <p className="text-parchment-400 mb-4">
                {filter !== 'all' ? 'No quests match your filter.' : 'The board is empty.'}
              </p>
              {filter !== 'all' ? (
                <Button variant="ghost" onClick={() => setFilter('all')}>Show All Quests</Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsModalOpen(true)}>Be the first to post!</Button>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuestBoardPage;
