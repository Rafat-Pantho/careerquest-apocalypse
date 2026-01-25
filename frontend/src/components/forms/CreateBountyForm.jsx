import { useState } from 'react';
import axios from 'axios';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateBountyForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    amount: '',
    location: ''
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
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        location: formData.location,
        reward: {
          amount: Number(formData.amount),
          currency: 'Gold Coins (BDT)',
          frequency: 'Monthly'
        }
      };

      await axios.post(`${API_URL}/bounties`, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post bounty');
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

      <div>
        <label className="block text-parchment-400 text-sm mb-1">Bounty Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
          placeholder="e.g. Tutor for Grade 9 Math"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Subject (The Beast)</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            placeholder="e.g. Mathematics"
            required
          />
        </div>
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Grade Level</label>
          <input
            type="text"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            placeholder="e.g. Class 9"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-parchment-400 text-sm mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field w-full h-24 bg-dungeon-800 border-dungeon-600 text-parchment-100"
          placeholder="Describe the student's needs..."
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-parchment-400 text-sm mb-1">Reward (BDT/Month)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="input-field w-full bg-dungeon-800 border-dungeon-600 text-parchment-100"
            placeholder="e.g. 5000"
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
            placeholder="e.g. Dhanmondi"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-dungeon-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="stone" loading={loading}>Post Bounty</Button>
      </div>
    </form>
  );
};

export default CreateBountyForm;
