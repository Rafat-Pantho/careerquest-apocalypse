import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/logo/icon.svg';

// Import Character Sprites
import warriorImg from '../assets/characters/warrior.png';
import mageImg from '../assets/characters/mage.png';
import rogueImg from '../assets/characters/rogue.png';
import healerImg from '../assets/characters/healer.png';
import scholarImg from '../assets/characters/scholar.png';
import rangerImg from '../assets/characters/ranger.png';

// Map IDs to Images
const CHAR_IMAGES = {
  warrior: warriorImg,
  mage: mageImg,
  rogue: rogueImg,
  healer: healerImg,
  scholar: scholarImg,
  ranger: rangerImg,
};

// Avatar options for users to choose from
const AVATARS = [
  { id: 'warrior', emoji: '⚔️', name: 'Warrior', color: 'from-red-600 to-orange-600' },
  { id: 'mage', emoji: '🧙‍♂️', name: 'Mage', color: 'from-purple-600 to-blue-600' },
  { id: 'rogue', emoji: '🗡️', name: 'Rogue', color: 'from-gray-600 to-slate-600' },
  { id: 'healer', emoji: '✨', name: 'Healer', color: 'from-green-600 to-emerald-600' },
  { id: 'scholar', emoji: '📚', name: 'Scholar', color: 'from-amber-600 to-yellow-600' },
  { id: 'ranger', emoji: '🏹', name: 'Ranger', color: 'from-teal-600 to-cyan-600' },
];

// Character Greetings
const CHAR_GREETINGS = {
  warrior: "Strength and honor, friend!",
  mage: "The arcane arts welcome you.",
  rogue: "Keep your voice down...",
  healer: "May your journey be safe.",
  scholar: "Knowledge is the greatest weapon.",
  ranger: "My bow is yours.",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pop-up state
  const [activeChar, setActiveChar] = useState(null);

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
    // Trigger pop-up
    setActiveChar(avatarId);
    // Auto-hide after 3 seconds
    setTimeout(() => setActiveChar(null), 3000);
  };

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Success Animation Logic
  useEffect(() => {
    if (showSuccessAnimation) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000); // Redirect after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation, navigate]);

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
      // Trigger Success Animation instead of immediate redirect
      setShowSuccessAnimation(true);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  // Skill Effects based on avatar
  const getSkillEffect = (avatarId) => {
    switch (avatarId) {
      case 'warrior':
        return (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0] }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-white rotate-45 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          />
        );
      case 'mage':
        return (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-purple-500 blur-xl opacity-50 mix-blend-screen"
          />
        );
      case 'rogue':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="absolute inset-0 bg-black mix-blend-overlay"
          />
        );
      case 'healer':
        return (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0, 0.6, 0] }}
            transition={{ delay: 2.5, duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-green-400 shadow-[0_0_30px_#4ade80]"
          />
        );
      case 'scholar':
        return (
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -50, opacity: [0, 1, 0] }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl text-yellow-300 font-bold"
          >
            ✦ Insight ✦
          </motion.div>
        );
      case 'ranger':
        return (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 100, opacity: [0, 1, 0] }}
            transition={{ delay: 2.5, duration: 0.3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-teal-300 shadow-[0_0_10px_#5eead4]"
          />
        );
      default:
        return null;
    }
  };

  const getSuccessMessage = (avatarId) => {
    switch (avatarId) {
      case 'warrior': return "Victory is ours! To the arena!";
      case 'mage': return "The mana flows... Teleporting!";
      case 'rogue': return "Contract accepted. Vanishing...";
      case 'healer': return "Spirit bound. Let us begin.";
      case 'scholar': return "Thesis approved. Proceeding.";
      case 'ranger': return "Target marked. Moving out.";
      default: return "Ready for adventure!";
    }
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
                  className={`relative p-3 rounded-xl transition-all ${formData.avatar === avatar.id
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

      {/* Character Pop-up Overlay (Selection) */}
      <AnimatePresence>
        {activeChar && !showSuccessAnimation && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ y: 50, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="mb-6 bg-white text-dungeon-900 px-8 py-4 rounded-3xl rounded-bl-none shadow-2xl border-4 border-gold-500 relative transform -translate-x-12"
                initial={{ opacity: 0, scale: 0, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="font-bold font-cinzel text-xl">{CHAR_GREETINGS[activeChar]}</span>
                <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-4 border-r-4 border-gold-500 transform rotate-45"></div>
              </motion.div>

              <img
                src={CHAR_IMAGES[activeChar]}
                alt={activeChar}
                className="w-96 h-96 object-contain filter drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS ANIMATION OVERLAY */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-dungeon-950/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative flex flex-col items-center justify-center w-full h-full">

              {/* Skill Effect Container */}
              {getSkillEffect(formData.avatar)}

              {/* Avatar Animation */}
              <motion.div
                className="relative z-10"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {/* Speech Bubble */}
                <motion.div
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 bg-gold-100 text-dungeon-900 px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.4)] border-4 border-gold-500 text-center z-20"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <p className="font-bold font-cinzel text-lg">{getSuccessMessage(formData.avatar)}</p>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gold-100 border-b-4 border-r-4 border-gold-500 transform rotate-45"></div>
                </motion.div>

                {/* Avatar with Skill Action */}
                <motion.img
                  src={CHAR_IMAGES[formData.avatar]}
                  alt={formData.avatar}
                  className="w-[500px] h-[500px] object-contain filter drop-shadow-[0_0_50px_rgba(251,191,36,0.6)]"
                  style={{ imageRendering: 'pixelated' }}
                  animate={
                    formData.avatar === 'warrior' ? { x: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } :
                      formData.avatar === 'mage' ? { y: [0, -20, 0], filter: ["drop-shadow(0 0 50px rgba(147,51,234,0.6))", "drop-shadow(0 0 80px rgba(147,51,234,1))", "drop-shadow(0 0 50px rgba(147,51,234,0.6))"] } :
                        formData.avatar === 'rogue' ? { opacity: [1, 0.5, 1], x: [0, 50, -50, 0] } :
                          formData.avatar === 'healer' ? { scale: [1, 1.05, 1], filter: ["hue-rotate(0deg)", "hue-rotate(45deg)", "hue-rotate(0deg)"] } :
                            { scale: [1, 1.05, 1] }
                  }
                  transition={{ delay: 2.5, duration: 1 }}
                />
              </motion.div>

              {/* Welcome Text */}
              <motion.h2
                className="mt-8 text-4xl font-cinzel text-gold-400 drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Welcome, {formData.username}!
              </motion.h2>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
