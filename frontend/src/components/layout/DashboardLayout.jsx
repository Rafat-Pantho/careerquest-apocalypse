import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
// import logoIcon from '../../assets/logo/icon.svg'; // Use text for now to be clean

const NavItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`
    flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium
    ${active
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}
  `}>
    <span className="text-lg opacity-80">{icon}</span>
    <span>{label}</span>
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
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/quests', icon: 'briefcase', label: 'Jobs & Projects' }, // Using briefcase emoji fallback if needed: 💼
    { to: '/bounties', icon: '🎯', label: 'Bounties' },
    { to: '/guilds', icon: '👥', label: 'Communities' },
    { to: '/guild-chat', icon: '💬', label: 'Messages' },
    { to: '/barter-tavern', icon: '🔄', label: 'Skill Exchange' },
    { to: '/summoning-circle', icon: '🎓', label: 'Mentorship' },
    { to: '/oracle', icon: '🤖', label: 'AI Career Coach' },
    { to: '/boss-battles', icon: '📝', label: 'Assessments' },
    { to: '/character-sheet', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-20">
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 dark:text-white text-lg leading-none">CareerQuest</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Enterprise Edition</span>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold text-lg">
              {user?.heroName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">{user?.heroName || 'User'}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{user?.heroClass || 'Developer'}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>{user?.xpProgress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full"
              style={{ width: `${user?.xpProgress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={
                // Simple emoji mapping for now until Lucide icons are integrated
                item.icon === 'briefcase' ? '💼' : item.icon
              }
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
            onClick={handleLogout}
          >
            <span className="mr-2">🚪</span> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
