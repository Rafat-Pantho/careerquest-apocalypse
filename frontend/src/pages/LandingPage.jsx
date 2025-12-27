/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Landing Page - The Gateway to the Realm
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';


import logoIcon from '../assets/logo/icon.svg';

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
        {/* Fog/Mist Overlay */}
        <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/gist/rafat-dev/placeholder/fog.png')] opacity-10 animate-pulse"></div>
        
        {/* Floating Particles (Simulated with divs) */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-400 rounded-full opacity-40"
            initial={{ 
              x: particle.x, 
              y: particle.y 
            }}
            animate={{ 
              y: [null, particle.yEnd],
              opacity: [0, 0.8, 0]
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
          className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center"
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
                SURVIVE THE <br/>
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
            className="relative hidden md:block"
            animate={floatAnimation}
          >
            {/* Main Card Visual */}
            <div className="relative z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="dungeon-card border-gold-500/30 bg-dungeon-800/90 backdrop-blur-xl p-8 max-w-md mx-auto shadow-2xl shadow-gold-900/20">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl text-gold-400">Code Wizard</h3>
                    <p className="text-parchment-400 text-sm">Level 1 Job Seeker</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-dungeon-700 border-2 border-gold-500 flex items-center justify-center text-2xl">
                    🧙‍♂️
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="stat-box">
                    <div className="stat-value text-mana-400">95</div>
                    <div className="stat-label">JavaScript</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value text-hp-red-400">12</div>
                    <div className="stat-label">Rejections</div>
                  </div>
                </div>

                {/* Quest Log Preview */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-widest text-parchment-500 mb-2">Active Quests</div>
                  <div className="p-3 rounded bg-dungeon-900/50 border border-dungeon-600 flex justify-between items-center">
                    <span className="text-parchment-200">Slay the Bug</span>
                    <span className="badge badge-gold">500 XP</span>
                  </div>
                  <div className="p-3 rounded bg-dungeon-900/50 border border-dungeon-600 flex justify-between items-center">
                    <span className="text-parchment-200">Interview with HR</span>
                    <span className="badge badge-danger">Boss</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements behind card */}
            <div className="absolute top-10 -right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-mana-500/10 rounded-full blur-3xl -z-10"></div>
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
  </motion.div>
);

export default LandingPage;
