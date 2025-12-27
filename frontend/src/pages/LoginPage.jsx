import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/logo/icon.svg';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard'); // Redirect to home/dashboard
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dungeon-900">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/gist/rafat-dev/placeholder/dungeon-wall.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-dungeon-900/80 via-dungeon-900/50 to-dungeon-900"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        {/* Card Container */}
        <div className="dungeon-card border-2 border-dungeon-600 shadow-2xl bg-dungeon-800/90 backdrop-blur-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <img src={logoIcon} alt="CareerQuest" className="w-16 h-16 mx-auto drop-shadow-glow-gold hover:scale-110 transition-transform" />
            </Link>
            <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Welcome Back, Hero</h1>
            <p className="text-parchment-400 text-sm">Enter your credentials to access the realm</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-parchment-300 text-sm font-bold mb-2 font-cinzel">
                Email Scroll
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full bg-dungeon-900/50 border-dungeon-600 focus:border-gold-500 text-parchment-100"
                placeholder="hero@guild.com"
                required
              />
            </div>

            <div>
              <label className="block text-parchment-300 text-sm font-bold mb-2 font-cinzel">
                Secret Rune (Password)
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full bg-dungeon-900/50 border-dungeon-600 focus:border-gold-500 text-parchment-100"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-parchment-400 cursor-pointer hover:text-parchment-200">
                <input type="checkbox" className="mr-2 accent-gold-500" />
                Remember Me
              </label>
              <a href="#" className="text-gold-400 hover:text-gold-300 hover:underline">
                Forgot Rune?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center">
                {error}
              </div>
            )}

            <Button variant="gold" fullWidth size="lg" type="submit" loading={isLoading}>
              Enter Realm
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-parchment-400 text-sm">
            <p>New to the adventure?</p>
            <Link to="/register" className="text-mana-400 hover:text-mana-300 font-bold hover:underline mt-1 inline-block">
              Create New Character
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
