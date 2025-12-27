import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/logo/icon.svg';

// Avatar options for users to choose from
const AVATARS = [
  { id: 'warrior', emoji: '⚔️', name: 'Warrior', color: 'from-red-600 to-orange-600' },
  { id: 'mage', emoji: '🧙‍♂️', name: 'Mage', color: 'from-purple-600 to-blue-600' },
  { id: 'rogue', emoji: '🗡️', name: 'Rogue', color: 'from-gray-600 to-slate-600' },
  { id: 'healer', emoji: '✨', name: 'Healer', color: 'from-green-600 to-emerald-600' },
  { id: 'scholar', emoji: '📚', name: 'Scholar', color: 'from-amber-600 to-yellow-600' },
  { id: 'ranger', emoji: '🏹', name: 'Ranger', color: 'from-teal-600 to-cyan-600' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    heroClass: 'Code Wizard',
    avatar: 'mage' // Default avatar
  });

  const heroClasses = [
    'Code Wizard',
    'Data Sorcerer',
    'Design Enchanter',
    'Merchant Lord',
    'Word Weaver'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatarId) => {
    setFormData({ ...formData, avatar: avatarId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Secret Runes do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Secret Rune must be at least 6 characters!');
      return;
    }

    setIsLoading(true);
    
    const result = await register({
      name: formData.username,
      email: formData.email,
      password: formData.password,
      heroClass: formData.heroClass,
      avatar: formData.avatar
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dungeon-900 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dungeon-900/80 via-dungeon-900/50 to-dungeon-900"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl px-4"
      >
        {/* Card Container */}
        <div className="dungeon-card border-2 border-dungeon-600 shadow-2xl bg-dungeon-800/90 backdrop-blur-sm">
          
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <img src={logoIcon} alt="CareerQuest" className="w-16 h-16 mx-auto drop-shadow-glow-gold hover:scale-110 transition-transform" />
            </Link>
            <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Character Creation</h1>
            <p className="text-parchment-400 text-sm">Begin your journey in the CareerQuest realm</p>
          </div>

          {/* Avatar Selection */}
          <div className="mb-6">
            <h3 className="text-gold-500 font-cinzel border-b border-dungeon-600 pb-2 mb-4 text-center">Choose Your Avatar</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {AVATARS.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleAvatarSelect(avatar.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-xl transition-all ${
                    formData.avatar === avatar.id
                      ? `bg-gradient-to-br ${avatar.color} ring-2 ring-gold-400 ring-offset-2 ring-offset-dungeon-800`
                      : 'bg-dungeon-700 hover:bg-dungeon-600'
                  }`}
                >
                  <div className="text-3xl mb-1">{avatar.emoji}</div>
                  <div className={`text-xs ${formData.avatar === avatar.id ? 'text-white' : 'text-parchment-400'}`}>
                    {avatar.name}
                  </div>
                  {formData.avatar === avatar.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            
            {/* Left Column - Identity */}
            <div className="space-y-4">
              <h3 className="text-gold-500 font-cinzel border-b border-dungeon-600 pb-2 mb-4">Identity</h3>
              
              <div>
                <label className="block text-parchment-300 text-sm font-bold mb-2">Hero Name</label>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Sir Codes-a-Lot"
                  required
                />
              </div>

              <div>
                <label className="block text-parchment-300 text-sm font-bold mb-2">Email Scroll</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="hero@guild.com"
                  required
                />
              </div>
            </div>

            {/* Right Column - Class & Security */}
            <div className="space-y-4">
              <h3 className="text-gold-500 font-cinzel border-b border-dungeon-600 pb-2 mb-4">Class & Security</h3>

              <div>
                <label className="block text-parchment-300 text-sm font-bold mb-2">Choose Class</label>
                <select 
                  name="heroClass"
                  value={formData.heroClass}
                  onChange={handleChange}
                  className="input-field w-full cursor-pointer"
                >
                  {heroClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-parchment-300 text-sm font-bold mb-2">Secret Rune (min 6 chars)</label>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-parchment-300 text-sm font-bold mb-2">Confirm Rune</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Full Width Submit */}
            <div className="md:col-span-2 mt-4">
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center">
                  {error}
                </div>
              )}
              <Button variant="gold" fullWidth size="lg" type="submit" loading={isLoading}>
                Summon Hero
              </Button>
            </div>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-parchment-400 text-sm">
            <p>Already have a character?</p>
            <Link to="/login" className="text-mana-400 hover:text-mana-300 font-bold hover:underline mt-1 inline-block">
              Enter Realm
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
