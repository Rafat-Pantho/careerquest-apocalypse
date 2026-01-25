import { useState } from 'react';
import axios from 'axios';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateBarterForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    offeringSkill: '',
    offeringDesc: '',
    seekingSkill: '',
    seekingDesc: ''
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
        offering: {
          skill: formData.offeringSkill,
          description: formData.offeringDesc
        },
        seeking: {
          skill: formData.seekingSkill,
          description: formData.seekingDesc
        }
      };

      await axios.post(`${API_URL}/barter`, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open stall');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Offering Column */}
        <div className="space-y-4">
          <h3 className="text-gold-400 font-cinzel border-b border-dungeon-600 pb-2">What You Offer</h3>
          <div>
            <label className="block text-parchment-400 text-sm mb-1">Skill Name</label>
            <input
              type="text"
              name="offeringSkill"
              value={formData.offeringSkill}
              onChange={handleChange}
              className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
              placeholder="e.g. Video Editing"
              required
            />
          </div>
          <div>
            <label className="block text-parchment-400 text-sm mb-1">Details</label>
            <textarea
              name="offeringDesc"
              value={formData.offeringDesc}
              onChange={handleChange}
              className="input-field w-full h-24 bg-dungeon-800 border-dungeon-600 text-parchment-100"
              placeholder="I can teach Premiere Pro..."
            />
          </div>
        </div>

        {/* Seeking Column */}
        <div className="space-y-4">
          <h3 className="text-mana-400 font-cinzel border-b border-dungeon-600 pb-2">What You Seek</h3>
          <div>
            <label className="block text-parchment-400 text-sm mb-1">Skill Name</label>
            <input
              type="text"
              name="seekingSkill"
              value={formData.seekingSkill}
              onChange={handleChange}
              className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
              placeholder="e.g. Calculus"
              required
            />
          </div>
          <div>
            <label className="block text-parchment-400 text-sm mb-1">Details</label>
            <textarea
              name="seekingDesc"
              value={formData.seekingDesc}
              onChange={handleChange}
              className="input-field w-full h-24 bg-dungeon-800 border-dungeon-600 text-parchment-100"
              placeholder="I need help with derivatives..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-dungeon-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="stone" loading={loading}>Open Stall</Button>
      </div>
    </form>
  );
};

export default CreateBarterForm;
