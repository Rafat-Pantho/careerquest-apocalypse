import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import ImageSequenceBackground from '../components/3d/ImageSequenceBackground';
import logoIcon from '../assets/logo/icon.svg';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen font-sans text-white selection:bg-gold-500/30 overflow-x-hidden">

      {/* ═════════════════════════════════════════════════════════════════════════
          FIXED BACKGROUND LAYER (Autoplay Loop)
          ═════════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ImageSequenceBackground />
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT LAYER
          ═════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navigation */}
        <nav className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 bg-black/10 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gold-500/20 to-transparent rounded-lg border border-gold-500/30">
              <img src={logoIcon} alt="CQ Logo" className="w-8 h-8 drop-shadow-glow-gold" />
            </div>
            <span className="font-cinzel font-bold text-xl tracking-wide">
              Career<span className="text-gold-400">Quest</span>
            </span>
          </div>

          <div className="flex gap-6 items-center">
            <Link to="/login" className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors">
              Agent Login
            </Link>
            <Link to="/register">
              <Button variant="gold" size="sm" className="shadow-lg shadow-gold-500/20 rounded-full px-6">
                Initialize
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section (Full Viewport) */}
        <section className="flex-grow flex flex-col justify-center items-center px-6 text-center py-20 min-h-[90vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "out" }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-mono tracking-wider text-gold-300 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM STATUS: ONLINE
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none drop-shadow-2xl">
              MASTER THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-600">
                CORPORATE DUNGEON
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              The ultimate career acceleration platform powered by gamification.
              Equip your resume, defeat the algorithm, and claim your offer letter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/register">
                <button className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Your Quest
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </span>
                </button>
              </Link>
              <Link to="/quests">
                <button className="px-8 py-4 bg-black/40 text-white border border-white/20 font-medium text-lg rounded-full backdrop-blur-md hover:bg-black/60 transition-all">
                  View Opportunities
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid (Below Fold) */}
        <section className="bg-dungeon-950/90 backdrop-blur-xl border-t border-white/5 py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureBox
                icon="⚔️"
                title="Visual Resume Builder"
                desc="Transform standard bullet points into a visual character sheet that highlights your strengths."
              />
              <FeatureBox
                icon="🛡️"
                title="Mock Interview AI"
                desc="Practice with our Oracle AI. Receive real-time feedback on your tone, confidence, and content."
              />
              <FeatureBox
                icon="💎"
                title="Job Matching Engine"
                desc="Our localized algorithm matches your skill tree with open quests in your region."
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-12 px-6 border-t border-white/10 text-center relative z-10">
          <div className="flex flex-col items-center gap-6">
            <img src={logoIcon} alt="CQ Logo" className="w-10 h-10 opacity-50 grayscale hover:grayscale-0 transition-all" />
            <p className="text-gray-500 text-sm">
              © 2024 CareerQuest. Forged for the ambitious.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-gold-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Support</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

const FeatureBox = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 group">
    <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl text-2xl mb-6 group-hover:scale-110 transition-transform border border-white/5 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 font-cinzel">{title}</h3>
    <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
  </div>
);

export default LandingPage;
