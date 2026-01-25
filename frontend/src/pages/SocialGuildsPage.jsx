import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SocialGuildsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      const response = await axios.get(`${API_URL}/guilds`);
      setGuilds(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuild = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/guilds`, {
        name: newGuildName,
        description: newGuildDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCreateModalOpen(false);
      fetchGuilds();
      // Optionally navigate to the new guild
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create guild');
    }
  };

  const handleJoinGuild = async (guildId) => {
    try {
      await axios.post(`${API_URL}/guilds/${guildId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('You have pledged your allegiance!');
      // Refresh user data or navigate
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join guild');
    }
  };

  if (user?.guild) {
    // If user is already in a guild, redirect to their guild page (we'll create this next)
    // For now, let's just show a button to go there
    return (
      <DashboardLayout>
        <div className="text-center mt-20">
          <h1 className="text-3xl font-cinzel text-gold-400 mb-4">You are already in a Guild!</h1>
          <Button onClick={() => navigate(`/guilds/${user.guild}`)}>Go to Guild Hall</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Guild Registry</h1>
          <p className="text-parchment-300">Join a band of heroes or forge your own destiny.</p>
        </div>
        <Button variant="gold" onClick={() => setIsCreateModalOpen(true)}>Found a Guild</Button>
      </div>

      {loading ? (
        <div className="col-span-full text-center text-parchment-400 py-12">Summoning guild scrolls...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guilds.map((guild) => (
          <div key={guild._id} className="dungeon-card hover:border-gold-500/50 transition-all">
            <h3 className="text-xl font-bold text-parchment-100 mb-2">{guild.name}</h3>
            <p className="text-parchment-400 text-sm mb-4 h-12 line-clamp-2">{guild.description}</p>
            <div className="flex justify-between items-center text-xs text-parchment-500 mb-4">
              <span>Members: {guild.members.length}</span>
              <span>Lvl {guild.level}</span>
            </div>
            <Button 
              variant="stone" 
              className="w-full"
              onClick={() => handleJoinGuild(guild._id)}
            >
              Join Guild
            </Button>
          </div>
        ))}
      </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Found a New Guild"
      >
        <form onSubmit={handleCreateGuild} className="space-y-4">
          <div>
            <label className="block text-parchment-300 mb-1">Guild Name</label>
            <input
              type="text"
              value={newGuildName}
              onChange={(e) => setNewGuildName(e.target.value)}
              className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
              required
            />
          </div>
          <div>
            <label className="block text-parchment-300 mb-1">Manifesto (Description)</label>
            <textarea
              value={newGuildDesc}
              onChange={(e) => setNewGuildDesc(e.target.value)}
              className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 h-24"
              required
            />
          </div>
          <Button type="submit" variant="gold" className="w-full">Establish Guild</Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default SocialGuildsPage;
