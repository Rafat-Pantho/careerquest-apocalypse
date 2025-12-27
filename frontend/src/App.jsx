/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Main Application Component
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, GameProvider } from './context';
import { SocketProvider } from './context/SocketContext';
import Button, { IconButton, ButtonGroup } from './components/ui/Button';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuestBoardPage from './pages/QuestBoardPage';
import MercenaryGuildPage from './pages/MercenaryGuildPage';
import SkillTavernPage from './pages/SkillTavernPage';
import SummoningCirclePage from './pages/SummoningCirclePage';
import OraclePage from './pages/OraclePage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import BossBattlePage from './pages/BossBattlePage';
import BattleArenaPage from './pages/BattleArenaPage';
import GuildChatPage from './pages/GuildChatPage';
import SocialGuildsPage from './pages/SocialGuildsPage';
import GuildHallPage from './pages/GuildHallPage';

// Temporary demo page to showcase the design system

function DesignSystemDemo() {
  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl mb-4 text-gradient-gold text-shadow-gold">
          CareerQuest
        </h1>
        <p className="text-2xl font-cinzel text-parchment-300">
          The Apocalypse
        </p>
        <p className="text-parchment-400 mt-2 font-inter">
          "Where job hunting meets fantasy adventure!"
        </p>
      </div>

      {/* Button Showcase */}
      <div className="max-w-4xl mx-auto">
        <div className="dungeon-card mb-8">
          <h2 className="text-2xl mb-6 text-gold-400">⚔️ Magical Stone Buttons</h2>
          
          {/* Button Variants */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg text-parchment-300 mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="stone">Stone Button</Button>
                <Button variant="gold">Gold Button</Button>
                <Button variant="mana">Mana Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="mystic">Mystic Button</Button>
                <Button variant="parchment">Parchment</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg text-parchment-300 mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="gold" size="sm">Small</Button>
                <Button variant="gold" size="md">Medium</Button>
                <Button variant="gold" size="lg">Large</Button>
                <Button variant="gold" size="xl">Extra Large</Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg text-parchment-300 mb-3">Button States</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="mana">Normal</Button>
                <Button variant="mana" disabled>Disabled</Button>
                <Button variant="mana" loading>Loading</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="text-lg text-parchment-300 mb-3">With Icons</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  variant="gold" 
                  leftIcon={<span>⚔️</span>}
                >
                  Start Quest
                </Button>
                <Button 
                  variant="mana" 
                  rightIcon={<span>→</span>}
                >
                  Continue
                </Button>
                <Button 
                  variant="danger" 
                  leftIcon={<span>💀</span>}
                >
                  Retreat
                </Button>
              </div>
            </div>

            {/* Full Width */}
            <div>
              <h3 className="text-lg text-parchment-300 mb-3">Full Width</h3>
              <Button variant="gold" fullWidth size="lg">
                ⚔️ Begin Your Adventure ⚔️
              </Button>
            </div>
          </div>
        </div>

        {/* Card Showcase */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="dungeon-card">
            <h3 className="text-xl text-gold-400 mb-3">🏰 Dungeon Card</h3>
            <p className="text-parchment-300">
              Dark, mysterious containers for displaying content in the depths of the realm.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="badge badge-gold">Level 42</span>
              <span className="badge badge-mana">Code Wizard</span>
            </div>
          </div>

          <div className="parchment-card">
            <h3 className="text-xl text-dungeon-800 mb-3">📜 Parchment Card</h3>
            <p className="text-dungeon-700">
              Ancient scroll-like containers perfect for displaying important documents and CVs.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="badge badge-success">Verified</span>
              <span className="badge badge-mystic">Legendary</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="dungeon-card mb-8">
          <h2 className="text-2xl mb-6 text-gold-400">🏆 Achievement Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge badge-gold">⭐ Gold Tier</span>
            <span className="badge badge-mana">💎 Mana Crystal</span>
            <span className="badge badge-mystic">🔮 Mystic</span>
            <span className="badge badge-success">✓ Verified Hero</span>
            <span className="badge badge-danger">☠️ Boss Slayer</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="dungeon-card mb-8">
          <h2 className="text-2xl mb-6 text-gold-400">📊 Progress Bars</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-xp-green-400">Experience Points</span>
                <span className="text-parchment-400">7,500 / 10,000 XP</span>
              </div>
              <div className="progress-bar progress-xp">
                <div className="progress-bar-fill" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-hp-red-400">Morale (HP)</span>
                <span className="text-parchment-400">45 / 100</span>
              </div>
              <div className="progress-bar progress-hp">
                <div className="progress-bar-fill" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-mana-400">Mana (Applications)</span>
                <span className="text-parchment-400">3 / 5 today</span>
              </div>
              <div className="progress-bar progress-mana">
                <div className="progress-bar-fill" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Input Demo */}
        <div className="dungeon-card mb-8">
          <h2 className="text-2xl mb-6 text-gold-400">📝 Input Fields</h2>
          <div className="space-y-4 max-w-md">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter your hero name..."
            />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Your magical email address..."
            />
            <textarea 
              className="input-field min-h-24 resize-none" 
              placeholder="Tell us your heroic tale..."
            />
          </div>
        </div>

        {/* Typography */}
        <div className="dungeon-card">
          <h2 className="text-2xl mb-6 text-gold-400">✨ Typography</h2>
          <div className="space-y-4">
            <h1>Heading 1 - The Epic Title</h1>
            <h2>Heading 2 - Quest Name</h2>
            <h3>Heading 3 - Section Title</h3>
            <h4>Heading 4 - Sub Section</h4>
            <p className="text-parchment-200">
              Body text with <a href="#">magical links</a> that glow with the power of mana.
              This is the Inter font for maximum readability when recruiters review your CV.
            </p>
            <p className="font-mono text-mana-400">
              Monospace: const hero = new CodeWizard();
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-parchment-500">
        <p className="font-cinzel">
          ⚔️ Ready to slay the Final Boss: UNEMPLOYMENT ⚔️
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SocketProvider>
        <AuthProvider>
          <GameProvider>
          <Routes>
            {/* Main Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quests" element={<QuestBoardPage />} />
            <Route path="/bounties" element={<MercenaryGuildPage />} />
            <Route path="/barter-tavern" element={<SkillTavernPage />} />
            <Route path="/summoning-circle" element={<SummoningCirclePage />} />
            <Route path="/oracle" element={<OraclePage />} />
            <Route path="/character-sheet" element={<CharacterSheetPage />} />
            <Route path="/character" element={<CharacterSheetPage />} />
            <Route path="/boss-battles" element={<BossBattlePage />} />
            <Route path="/boss-battles/:id" element={<BattleArenaPage />} />
            <Route path="/guild-chat" element={<GuildChatPage />} />
            <Route path="/guilds" element={<SocialGuildsPage />} />
            <Route path="/guilds/:id" element={<GuildHallPage />} />

            {/* Design System Demo */}
            <Route path="/design" element={<DesignSystemDemo />} />
          </Routes>
          </GameProvider>
        </AuthProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
