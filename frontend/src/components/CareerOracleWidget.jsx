import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Skull, Eye, Zap } from 'lucide-react';

const CareerOracleWidget = () => {
    const [prophecy, setProphecy] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await fetch('http://localhost:8000/api/resume/prophecy', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setProphecy(data.prophecy);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-black/50 p-6">
            <div className="flex justify-between items-center mb-4 z-10">
                <h3 className="text-xl font-display font-bold text-purple-400 flex items-center gap-2">
                    <Skull size={20} /> The Career Oracle
                </h3>
                {loading && <Zap className="animate-spin text-purple-500" />}
            </div>

            <div className="flex-1 flex gap-6 z-10">
                {/* Upload Area */}
                <label className="flex-1 border-2 border-dashed border-purple-500/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-900/10 transition-colors group">
                    <UploadCloud className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-purple-300/60 text-xs uppercase tracking-widest text-center">Offer thy scroll (PDF)</span>
                    <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
                </label>

                {/* Result Area */}
                <div className="flex-[2] bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl relative overflow-hidden">
                    {prophecy ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-serif text-lg text-purple-200 italic leading-relaxed text-center"
                        >
                            "{prophecy}"
                        </motion.p>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-purple-500/30">
                            <Eye size={40} className="mb-2 opacity-50" />
                            <span className="text-xs">The Oracle awaits your tribute...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        </div>
    );
};

export default CareerOracleWidget;