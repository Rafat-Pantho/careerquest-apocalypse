import { useState } from 'react';
import axios from 'axios';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateQuestForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    guild: '',
    type: 'Tutorial Level',
    difficulty: 'Novice',
    description: '',
    requirements: '', // Comma separated
    gold: '',
    xp: 100,
    location: 'Remote Realm',
    deadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split(',').map(s => s.trim()).filter(Boolean),
        rewards: {
          gold: formData.gold,
          xp: Number(formData.xp),
          perks: []
        }
      };

      await axios.post(`${API_URL}/quests`, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Quest Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            placeholder="e.g. Frontend Sorcerer Needed"
            required
          />
        </div>
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Guild Name</label>
          <input
            type="text"
            name="guild"
            value={formData.guild}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            placeholder="e.g. TechCorp"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
          >
            <option>Tutorial Level</option>
            <option>Raid Boss</option>
            <option>Side Quest</option>
            <option>Daily Grind</option>
          </select>
        </div>
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
          >
            <option>Novice</option>
            <option>Adept</option>
            <option>Veteran</option>
            <option>Legendary</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-parchment-400 text-sm mb-1">Description (The Lore)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field w-full h-24 bg-dungeon-800 border-dungeon-600 text-parchment-100"
          placeholder="Describe the challenge..."
          required
        />
      </div>

      <div>
        <label className="block text-parchment-400 text-sm mb-1">Requirements (comma separated)</label>
        <input
          type="text"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
          placeholder="React, Node.js, TypeScript"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Gold Reward</label>
          <input
            type="text"
            name="gold"
            value={formData.gold}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            placeholder="e.g. 50k-80k"
            required
          />
        </div>
        <div>
          <label className="block text-parchment-400 text-sm mb-1">XP Reward</label>
          <input
            type="number"
            name="xp"
            value={formData.xp}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            required
          />
        </div>
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-dungeon-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" loading={loading}>Post Quest</Button>
      </div>
    </form>
  );
};

export default CreateQuestForm;
