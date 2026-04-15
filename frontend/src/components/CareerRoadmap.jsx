import React from 'react';
import { CheckCircle, Circle, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    { title: 'Discovery', status: 'completed', desc: 'Identify career path & goals' },
    { title: 'Skill Acquisition', status: 'completed', desc: 'Master core competencies' },
    { title: 'Portfolio', status: 'current', desc: 'Build projects & showcase work' },
    { title: 'Interview Prep', status: 'upcoming', desc: 'Mock interviews with AI' },
    { title: 'Placement', status: 'upcoming', desc: 'Secure your dream role' },
];

const CareerRoadmap = () => {
    return (
        <div className="p-6 h-full">
            <h3 className="text-xl font-display font-bold text-white mb-6">Career Roadmap</h3>
            <div className="relative pl-4 border-l border-white/10 space-y-8">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative"
                    >
                        <div className={`absolute -left-[21px] top-1 bg-navy-900 rounded-full p-1 border-2 ${step.status === 'completed' ? 'border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(0,209,255,0.3)]' :
                            step.status === 'current' ? 'border-amber-500 text-amber-500 animate-pulse' :
                                'border-slate-700 text-slate-700'
                            }`}>
                            {step.status === 'completed' ? <CheckCircle size={16} /> : <Circle size={16} fill={step.status === 'current' ? "currentColor" : "none"} />}
                        </div>

                        <div>
                            <h4 className={`text-md font-bold font-display ${step.status === 'upcoming' ? 'text-slate-600' : 'text-white'}`}>
                                {step.title}
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">{step.desc}</p>
                        </div>

                        {idx < steps.length - 1 && (
                            <div className="absolute left-[-21px] top-8 bottom-[-24px] w-0.5 bg-white/10 -z-10"></div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CareerRoadmap;