import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ChevronRight, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        characterClass: 'Mage'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const CHARACTERS = [
        { name: 'Mage',     img: '/images/characters/mage.png' },
        { name: 'Fighter',  img: '/images/characters/fighter.png' },
        { name: 'Hunter',   img: '/images/characters/hunter.png' },
        { name: 'Tank',     img: '/images/characters/tank.png' },
        { name: 'Healer',   img: '/images/characters/healer.png' },
        { name: 'Assassin', img: '/images/characters/assassin.png' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                role: 'student',
                characterClass: formData.characterClass,
            };

            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/student-dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-cyan-400/30 selection:text-cyan-400">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

            {/* Back Button */}
            <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-slate-400 hover:text-white transition flex items-center gap-2">
                <ArrowLeft size={20} /> <span className="text-sm font-medium">Back to Home</span>
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16" />

                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Join CareerQuest</h2>
                    <p className="text-slate-400 text-sm">Begin your journey to professional excellence.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 relative z-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm"
                                required
                            />
                        </motion.div>
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                className="w-full px-4 py-3 rounded-xl bg-navy-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm"
                                required
                            />
                        </motion.div>
                    </div>

                    {/* Email */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm"
                            required
                        />
                    </motion.div>

                    {/* Password */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create Password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm"
                            required
                        />
                    </motion.div>

                    {/* Character Class — always visible */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="pt-1">
                        <label className="text-sm text-slate-400 mb-3 block font-medium">Choose Your Character Class</label>
                        <div className="grid grid-cols-3 gap-3">
                            {CHARACTERS.map((char) => (
                                <div
                                    key={char.name}
                                    onClick={() => setFormData({ ...formData, characterClass: char.name })}
                                    className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center gap-2 transition-all ${
                                        formData.characterClass === char.name
                                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105'
                                            : 'bg-navy-900 border-white/10 hover:border-cyan-400/50 hover:bg-navy-800'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                                        <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-xs font-bold ${formData.characterClass === char.name ? 'text-cyan-400' : 'text-slate-400'}`}>
                                        {char.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-400/20 hover:shadow-cyan-400/40 disabled:opacity-60"
                    >
                        {isLoading ? 'Creating Account...' : <> Create Account <ChevronRight size={18} /> </>}
                    </motion.button>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center text-sm text-slate-500 relative z-10"
                >
                    Already have an account?
                    <button onClick={() => navigate('/login')} className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline ml-1 transition-colors">
                        Sign In
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;