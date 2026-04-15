import React, { useState } from 'react';
import { X, Loader, Briefcase, GraduationCap, DollarSign, Signal, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reward: '',
        difficulty: 'Beginner',
        type: 'tuition', // default
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must be logged in to post.');
            }

            const res = await fetch('http://localhost:8000/api/bounties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    reward: Number(formData.reward)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create post');
            }

            if (onSuccess) onSuccess();
            onClose();
            setFormData({
                title: '',
                description: '',
                reward: '',
                difficulty: 'Beginner',
                type: 'tuition',
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-navy-950">
                            <h2 className="text-xl font-display font-bold text-white">Create New Post</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Need HSC Math Tutor"
                                        className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Type & Difficulty Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Post Type</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            {formData.type === 'job' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
                                        </div>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-cyan-400/50 transition"
                                        >
                                            <option value="tuition">Tuition</option>
                                            <option value="job">Job / Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Difficulty</label>
                                    <div className="relative">
                                        <Signal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-cyan-400/50 transition"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Reward */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reward (BDT)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="number"
                                        name="reward"
                                        value={formData.reward}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the role requirements, location, timing, etc..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-navy-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-400/20 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading && <Loader size={18} className="animate-spin" />}
                                {loading ? 'Publishing...' : 'Publish Post'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreatePostModal;
