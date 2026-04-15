import React, { useState } from 'react';

const CreateBountyModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    goblinCount: 10,
    reward: 100,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'goblinCount' || name === 'reward' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.goblinCount < 10 || formData.goblinCount > 20) {
      alert("Goblin count must be strictly between 10 and 20.");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-purple-500/40 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] w-full max-w-lg p-6 relative overflow-hidden">
        {/* Neon Top Bar Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-6 drop-shadow-sm font-serif tracking-wide">
          Post Hunting Bounty
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-purple-300 text-sm font-semibold mb-1">Quest Title</label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Clear out the Server Room Goblins"
              required
              className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-purple-300 text-sm font-semibold mb-1">Goblin Count</label>
              <input 
                type="number"
                name="goblinCount"
                min="10"
                max="20"
                value={formData.goblinCount}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              />
              <p className="text-xs text-fuchsia-400/80 mt-1">Target: 10 - 20</p>
            </div>
            <div className="flex-1">
              <label className="block text-blue-300 text-sm font-semibold mb-1">Reward (Points)</label>
              <input 
                type="number"
                name="reward"
                min="1"
                value={formData.reward}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-300 text-sm font-semibold mb-1">Quest Lore</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the threat and the consequences if left unchecked..."
              required
              className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-500 resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            Publish Bounty
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBountyModal;
