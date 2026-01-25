import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import logoIcon from '../../assets/logo/icon.svg';
import { getAvatarEmoji, getAvatarColor } from '../../utils/avatarUtils';

const NavItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
    ${active 
      ? 'bg-dungeon-700 text-gold-400 border border-dungeon-600 shadow-inner' 
      : 'text-parchment-400 hover:bg-dungeon-800 hover:text-parchment-100'}
  `}>
    <span className="text-xl">{icon}</span>
    <span className="font-cinzel text-sm tracking-wide">{label}</span>
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: '🏰', label: 'Stronghold' },
    { to: '/quests', icon: '📜', label: 'Quest Board' },
    { to: '/bounties', icon: '💰', label: 'Bounty Board' },
    { to: '/guilds', icon: '🛡️', label: 'Guilds' },
    { to: '/guild-chat', icon: '🍺', label: 'The Tavern' },
    { to: '/barter-tavern', icon: '⚖️', label: 'Skill Tavern' },
    { to: '/summoning-circle', icon: '🔮', label: 'Summoning Circle' },
    { to: '/oracle', icon: '👁️', label: 'The Oracle' },
    { to: '/boss-battles', icon: '👹', label: 'Boss Battles' },
    { to: '/character-sheet', icon: '👤', label: 'Character Sheet' },
  ];

  return (
    <div className="min-h-screen bg-dungeon-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dungeon-900 border-r border-dungeon-700 flex flex-col fixed h-full z-20">
        {/* Logo Area */}
        <div className="p-6 border-b border-dungeon-700 flex items-center gap-3">
          <img src={logoIcon} alt="CQ" className="w-10 h-10 drop-shadow-glow-gold" />
          <div>
            <h1 className="font-cinzel text-gold-400 text-lg leading-none">CareerQuest</h1>
            <span className="text-xs text-parchment-500 font-mono">The Apocalypse</span>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-dungeon-700 bg-dungeon-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center overflow-hidden bg-gradient-to-br ${getAvatarColor(user?.avatar)}`}>
              <span className="text-xl">{getAvatarEmoji(user?.avatar)}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-parchment-100 font-bold text-sm truncate">{user?.heroName || 'Unknown Hero'}</p>
              <p className="text-gold-500 text-xs truncate">{user?.heroClass || 'Unclassed'}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-between text-xs text-parchment-400">
            <span>Lvl {user?.level || 1}</span>
            <span>{user?.experiencePoints || 0} XP</span>
          </div>
          <div className="w-full bg-dungeon-950 h-1.5 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-gold-500 h-full rounded-full" 
              style={{ width: `${user?.xpProgress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dungeon-700">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <span className="mr-2">🚪</span> Leave Realm
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-[url('https://raw.githubusercontent.com/gist/rafat-dev/placeholder/dungeon-wall.png')] bg-fixed">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
