import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BattleArenaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [battle, setBattle] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [victory, setVictory] = useState(false);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const response = await axios.get(`${API_URL}/boss-battles/${id}`);
        setBattle(response.data.data);
        setCode(response.data.data.starterCode);
      } catch (error) {
        console.error('Failed to fetch battle:', error);
        navigate('/boss-battles');
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();
  }, [id, navigate]);

  const handleAttack = async () => {
    setAttacking(true);
    try {
      const response = await axios.post(
        `${API_URL}/boss-battles/${id}/attack`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { isVictory, damageDealt, message } = response.data;

      setBattleLog(prev => [
        { 
          timestamp: new Date().toLocaleTimeString(), 
          message, 
          type: isVictory ? 'victory' : damageDealt > 0 ? 'damage' : 'fail' 
        },
        ...prev
      ]);

      if (isVictory) {
        setVictory(true);
      }

    } catch (error) {
      setBattleLog(prev => [
        { 
          timestamp: new Date().toLocaleTimeString(), 
          message: error.response?.data?.message || 'Server Error', 
          type: 'error' 
        },
        ...prev
      ]);
    } finally {
      setAttacking(false);
    }
  };

  if (loading) return <div className="text-center text-parchment-100 mt-20">Loading Arena...</div>;
  if (!battle) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-cinzel text-red-500">{battle.title}</h1>
            <p className="text-parchment-400">Level {battle.levelRequirement} Boss • {battle.xpReward} XP Reward</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/boss-battles')}>
            Retreat
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Column: Boss Info & Problem */}
          <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Boss Visual */}
            <div className="dungeon-card bg-dungeon-900/80 p-6 text-center relative overflow-hidden group">
              <div className={`text-9xl transition-transform duration-500 ${attacking ? 'scale-110' : 'scale-100'} ${victory ? 'opacity-50 grayscale' : ''}`}>
                👾
              </div>
              {victory && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-4xl font-cinzel text-gold-400 animate-bounce">DEFEATED</span>
                </div>
              )}
              <div className="mt-4 w-full bg-dungeon-950 h-4 rounded-full overflow-hidden border border-dungeon-700">
                <div 
                  className="h-full bg-red-600 transition-all duration-1000"
                  style={{ width: victory ? '0%' : '100%' }}
                ></div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="dungeon-card flex-1">
              <h3 className="text-xl font-cinzel text-parchment-100 mb-4 border-b border-dungeon-700 pb-2">
                The Challenge
              </h3>
              <p className="text-parchment-300 mb-4">{battle.description}</p>
              <div className="bg-dungeon-950 p-4 rounded border border-dungeon-700 font-mono text-sm text-parchment-200">
                {battle.problemStatement}
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & Logs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Code Editor */}
            <div className="dungeon-card flex-1 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-parchment-200 font-mono text-sm">Spellbook (Editor)</h3>
                <span className="text-xs text-dungeon-400">JavaScript</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-dungeon-950 text-parchment-100 font-mono p-4 rounded border border-dungeon-700 focus:border-mystic-500 focus:outline-none resize-none"
                spellCheck="false"
                disabled={victory}
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="danger" 
                  onClick={handleAttack} 
                  loading={attacking}
                  disabled={victory}
                  className="w-full md:w-auto"
                >
                  {victory ? 'Victory Achieved!' : 'Cast Spell (Run Code)'}
                </Button>
              </div>
            </div>

            {/* Battle Log */}
            <div className="dungeon-card h-48 overflow-y-auto font-mono text-sm">
              <h3 className="text-parchment-400 text-xs uppercase tracking-wider mb-2 sticky top-0 bg-dungeon-800 py-1">
                Battle Log
              </h3>
              <div className="flex flex-col gap-2">
                {battleLog.length === 0 && (
                  <span className="text-dungeon-500 italic">The arena is silent...</span>
                )}
                {battleLog.map((log, index) => (
                  <div key={index} className={`flex gap-2 ${
                    log.type === 'victory' ? 'text-gold-400' :
                    log.type === 'damage' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-parchment-300'
                  }`}>
                    <span className="text-dungeon-500">[{log.timestamp}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BattleArenaPage;
