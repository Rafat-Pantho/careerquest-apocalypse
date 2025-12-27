import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BossBattlePage = () => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const response = await axios.get(`${API_URL}/boss-battles`);
        setBattles(response.data.data);
      } catch (error) {
        console.error('Failed to fetch battles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-cinzel text-red-500 mb-4 drop-shadow-lg">Boss Battles</h1>
          <p className="text-parchment-300 text-xl">Prove your worth, Code Warrior. Defeat these beasts to earn glory and XP!</p>
        </div>

        {loading ? (
          <div className="text-center text-parchment-100">Summoning Bosses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {battles.map((battle) => (
              <div key={battle._id} className="dungeon-card group hover:border-red-500/50 transition-all duration-300">
                <div className="h-48 bg-dungeon-900 rounded-t-lg mb-4 overflow-hidden relative">
                  {/* Placeholder for Boss Image */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    👾
                  </div>
                  <div className="absolute top-2 right-2 bg-dungeon-950/80 px-3 py-1 rounded border border-red-500/30 text-red-400 text-sm font-bold">
                    {battle.difficulty}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-2xl font-cinzel text-parchment-100 mb-2 group-hover:text-red-400 transition-colors">
                    {battle.title}
                  </h3>
                  <p className="text-parchment-400 text-sm mb-4 h-20 overflow-hidden">
                    {battle.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gold-400 text-sm">
                      🏆 {battle.xpReward} XP
                    </span>
                    <span className="text-mystic-400 text-sm">
                      Lvl {battle.levelRequirement}+
                    </span>
                  </div>

                  <Link to={`/boss-battles/${battle._id}`}>
                    <Button variant="danger" className="w-full">
                      Enter Arena
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BossBattlePage;
