import { useState } from 'react';
import axios from 'axios';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SummonElderForm = ({ elder, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    topic: '',
    incantation: ''
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
        elderId: elder._id,
        topic: formData.topic,
        incantation: formData.incantation
      };

      await axios.post(`${API_URL}/mentorship/summon`, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'The ritual failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4 mb-6 p-4 bg-dungeon-800 rounded border border-dungeon-600">
        <div className="w-12 h-12 rounded-full bg-dungeon-700 overflow-hidden border border-gold-500">
          <img src={elder.avatar} alt={elder.heroName} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-parchment-400 text-xs uppercase">Summoning</p>
          <h3 className="text-lg font-bold text-parchment-100">{elder.heroName}</h3>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-parchment-400 text-sm mb-1">Topic of Guidance</label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
          placeholder="e.g. Career Advice, Code Review"
          required
        />
      </div>

      <div>
        <label className="block text-parchment-400 text-sm mb-1">The Incantation (Message)</label>
        <textarea
          name="incantation"
          value={formData.incantation}
          onChange={handleChange}
          className="input-field w-full h-32 bg-dungeon-800 border-dungeon-600 text-parchment-100 font-cinzel"
          placeholder="Oh wise Elder, I seek your wisdom regarding..."
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-dungeon-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Retreat</Button>
        <Button type="submit" variant="mystic" loading={loading}>Begin Ritual</Button>
      </div>
    </form>
  );
};

export default SummonElderForm;
