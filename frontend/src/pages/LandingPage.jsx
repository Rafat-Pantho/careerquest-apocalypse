/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Landing Page - The Gateway to the Realm
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';


import logoIcon from '../assets/logo/icon.svg';
// Original Assets
import spellBoltImg from '../assets/effects/spell-bolt.png';
import fireballImg from '../assets/effects/fireball.png';
import darkSpellImg from '../assets/effects/dark-spell.png';

const LandingPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Generate stable random particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles([...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,

      yEnd: Math.random() * -100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5
    })));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">

      {/* ═════════════════════════════════════════════════════════════════════════
          BACKGROUND EFFECTS
          ═════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-dungeon-950">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-mana-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        {/* Fog/Mist Overlay */}
        <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/gist/rafat-dev/placeholder/fog.png')] opacity-20 animate-pulse-slow"></div>

        {/* Floating Particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-400 rounded-full shadow-[0_0_5px_#fbbf24]"
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0
            }}
            animate={{
              y: [null, particle.yEnd],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: particle.delay
            }}
          />
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          NAVIGATION BAR
          ═════════════════════════════════════════════════════════════════════════ */}
      <nav className="relative z-50 px-6 py-4 flex justify-between items-center border-b border-dungeon-700 bg-dungeon-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="CQ Logo" className="w-10 h-10 drop-shadow-glow-gold" />
          <span className="font-cinzel font-bold text-xl text-gold-400 hidden md:block">
            CareerQuest
          </span>
        </div>

        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="gold" size="sm">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* ═════════════════════════════════════════════════════════════════════════
          HERO SECTION
          ═════════════════════════════════════════════════════════════════════════ */}
      <main className="flex-grow relative z-10 flex items-center justify-center px-4 py-12">
        <motion.div
          className="max-w-7xl w-full grid md:grid-cols-2 gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Text Content */}
          <div className="space-y-8 text-center md:text-left">
            <motion.div variants={itemVariants}>
              <span className="badge badge-gold mb-4 text-sm uppercase tracking-widest">
                Early Access Alpha
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 via-gold-500 to-gold-700 drop-shadow-sm leading-tight">
                SURVIVE THE <br />
                <span className="text-white text-shadow-dark">JOB HUNT</span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-xl text-parchment-200 leading-relaxed max-w-lg mx-auto md:mx-0">
              Equip your resume, choose your class, and slay the final boss of unemployment in this RPG-powered career platform.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button variant="gold" size="xl" withGlow className="animate-pulse-slow">
                Start Your Adventure
              </Button>
              <Button variant="stone" size="xl" leftIcon={<span>📜</span>}>
                View Quest Board
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-8 flex items-center gap-6 justify-center md:justify-start text-parchment-400 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-xp-green-500 rounded-full animate-pulse"></span>
                <span>1,240 Heroes Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-mana-500 rounded-full animate-pulse"></span>
                <span>542 Quests Available</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visuals */}
          <motion.div
            className="relative hidden md:flex items-center justify-center h-[500px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-dungeon-900/40 blur-3xl -z-10 rounded-full"></div>
            <BattleScene />
          </motion.div>
        </motion.div>
      </main>

      {/* ═════════════════════════════════════════════════════════════════════════
          FEATURE STRIP
          ═════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-dungeon-950/50 border-t border-dungeon-800 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📜"
            title="RPG Resume Builder"
            desc="Turn your boring CV into a legendary character sheet that recruiters actually want to read."
          />
          <FeatureCard
            icon="⚔️"
            title="Quest Board"
            desc="Apply to jobs as 'Quests'. Our AI calculates your survival probability before you enter the dungeon."
          />
          <FeatureCard
            icon="🔮"
            title="Oracle AI"
            desc="Practice interviews with a ruthless AI gatekeeper who judges your every word."
          />
        </div>
      </div>
    </div>
  );
};

// Helper Component for Features
const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    className="p-6 rounded-lg bg-dungeon-800/50 border border-dungeon-700 hover:border-gold-500/30 transition-colors group"
    whileHover={{ y: -5 }}
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="text-xl text-parchment-100 mb-2 font-cinzel">{title}</h3>
    <p className="text-parchment-400 text-sm leading-relaxed">{desc}</p>
  </motion.div >
);

// Load transparency-processed character sprites
const characterAssets = import.meta.glob('../assets/characters/*.png', { eager: true });

const getBeforeFightSprite = (char, index) => {
  // Helper to safely get the optimized sprite or fallback
  const path = `../assets/characters/${char}_pose_${index}.png`;
  return characterAssets[path]?.default;
};

const BattleScene = () => {
  const [phase, setPhase] = useState('sitting'); // sitting, standing, walking, fighting
  const [frame, setFrame] = useState(0);

  // Initial sequence timer
  useEffect(() => {
    // 1. Sit for 2 seconds
    const t1 = setTimeout(() => setPhase('standing'), 2000);

    // 2. Stand for 1.5 seconds then Walk
    const t2 = setTimeout(() => setPhase('walking'), 3500);

    // 3. Walk for 3 seconds (position interpolation handled by motion) then Fight
    const t3 = setTimeout(() => setPhase('fighting'), 6500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Frame animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => f + 1);
    }, 200); // 5 FPS for pixel art look
    return () => clearInterval(interval);
  }, []);

  // Determine current sprite based on phase and frame
  const getWizardSprite = () => {
    const f = frame;
    if (phase === 'sitting') return getBeforeFightSprite('wizard', 0 + (f % 2));
    if (phase === 'standing') return getBeforeFightSprite('wizard', 3 + (f % 3));
    if (phase === 'walking') return getBeforeFightSprite('wizard', 7 + (f % 4));
    // Fighting: Randomly switch between idle and attack poses
    return Math.random() > 0.8 ? getBeforeFightSprite('wizard', 5) : getBeforeFightSprite('wizard', 3 + (f % 3));
  };

  const getMageSprite = () => {
    const f = frame;
    // Mage has different indices based on file list
    if (phase === 'sitting') return getBeforeFightSprite('mage', 0 + (f % 3));
    if (phase === 'standing') return getBeforeFightSprite('mage', 8 + (f % 4));
    if (phase === 'walking') return getBeforeFightSprite('mage', 13 + (f % 3));
    return Math.random() > 0.8 ? getBeforeFightSprite('mage', 10) : getBeforeFightSprite('mage', 8 + (f % 4));
  };

  // Spell Logic (Active only during 'fighting')
  const [spells, setSpells] = useState([]);
  useEffect(() => {
    if (phase !== 'fighting') return;

    const interval = setInterval(() => {
      const id = Date.now();
      const isWizardTurn = Math.random() > 0.5;
      const spellType = isWizardTurn ? 'bolt' : 'fireball';

      setSpells(prev => [...prev, { id, type: spellType, isWizard: isWizardTurn }]);

      // Cleanup spell after animation
      setTimeout(() => {
        setSpells(prev => prev.filter(s => s.id !== id));
      }, 1500);
    }, 2000); // Cast frequently

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="relative w-full max-w-lg h-[400px] flex items-center justify-between px-4 perspective-1000">
      {/* Wizard */}
      <motion.div
        className="relative z-10 w-40"
        initial={{ x: 0 }}
        animate={{
          x: phase === 'walking' || phase === 'fighting' ? 50 : 0,
          y: phase === 'sitting' ? 20 : 0
        }}
        transition={{ duration: 3, ease: "linear" }}
      >
        <img
          src={getWizardSprite() || '../assets/characters/wizard.png'}
          alt="Wizard"
          className="w-full filter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          style={{ imageRendering: 'pixelated' }}
        />
        {phase !== 'sitting' && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 blur-md rounded-[100%]"></div>
        )}
      </motion.div>

      {/* Mage */}
      <motion.div
        className="relative z-10 w-48"
        initial={{ x: 0 }}
        animate={{
          x: phase === 'walking' || phase === 'fighting' ? -50 : 0,
          y: phase === 'sitting' ? 20 : 0,
          scaleX: -1
        }}
        transition={{ duration: 3, ease: "linear" }}
      >
        <img
          src={getMageSprite() || '../assets/characters/mage.png'}
          alt="Mage"
          className="w-full filter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          style={{ imageRendering: 'pixelated' }}
        />
        {phase !== 'sitting' && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/40 blur-md rounded-[100%]"></div>
        )}
      </motion.div>

      {/* Spells - Only visible during fighting */}
      <AnimatePresence>
        {phase === 'fighting' && spells.map(spell => (
          <motion.div
            key={spell.id}
            className="absolute z-20 pointer-events-none"
            initial={{
              left: spell.isWizard ? '35%' : 'auto',
              right: spell.isWizard ? 'auto' : '35%',
              top: '40%',
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              left: spell.isWizard ? '65%' : 'auto',
              right: spell.isWizard ? 'auto' : '65%',
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.5, 1],
              rotate: spell.isWizard ? 0 : 360 // Add rotation for dark orb
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "circIn" }}
          >
            <img
              src={spell.type === 'bolt' ? spellBoltImg : darkSpellImg}
              alt="spell"
              className={`w-24 mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] ${!spell.isWizard ? '' : ''}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Impact Flash Effect Layer */}
      <AnimatePresence>
        {phase === 'fighting' && spells.map(spell => (
          <motion.div
            key={`flash-${spell.id}`}
            className={`absolute w-32 h-32 rounded-full blur-xl opacity-0 ${spell.isWizard ? 'bg-mana-400' : 'bg-purple-600'}`} // Changed to purple for Mage
            style={{
              right: spell.isWizard ? '25%' : 'auto',
              left: spell.isWizard ? 'auto' : '25%',
              top: '30%'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0, 0.6, 0], scale: [1, 1.5] }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
