import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, RadarChart as RechartsRadarChart, Tooltip } from 'recharts'; // Corrected import
import { useWeirdMode } from '../context/WeirdModeContext';

const normalData = [
    { subject: 'Coding', A: 120, B: 110, fullMark: 150 },
    { subject: 'Communication', A: 98, B: 130, fullMark: 150 },
    { subject: 'Problem Solving', A: 86, B: 130, fullMark: 150 },
    { subject: 'Teamwork', A: 99, B: 100, fullMark: 150 },
    { subject: 'Leadership', A: 85, B: 90, fullMark: 150 },
    { subject: 'Creativity', A: 65, B: 85, fullMark: 150 },
];

const weirdData = [
    { subject: 'Coffee Stability', A: 120, B: 110, fullMark: 150 },
    { subject: 'Dark Mode Endurance', A: 98, B: 130, fullMark: 150 },
    { subject: 'Keyboard Clack', A: 140, B: 130, fullMark: 150 },
    { subject: 'Meme Recall', A: 99, B: 100, fullMark: 150 },
    { subject: 'Posture Decay', A: 85, B: 90, fullMark: 150 },
    { subject: 'Existential Dread', A: 65, B: 85, fullMark: 150 },
];

const SkillRadar = () => {
    const { isWeirdMode } = useWeirdMode();
    const data = isWeirdMode ? weirdData : normalData;

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <h3 className={`text-lg font-display font-bold mb-2 ${isWeirdMode ? 'text-purple-400' : 'text-white'}`}>
                {isWeirdMode ? 'Existential Analysis' : 'Skill Analysis'}
            </h3>
            <div className="w-full h-[250px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke={isWeirdMode ? "#a855f7" : "#1E293B"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: isWeirdMode ? '#d8b4fe' : '#94A3B8', fontSize: 10, fontFamily: isWeirdMode ? 'monospace' : 'sans-serif' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                            name="You"
                            dataKey="A"
                            stroke={isWeirdMode ? "#a855f7" : "#00D1FF"}
                            strokeWidth={2}
                            fill={isWeirdMode ? "#a855f7" : "#00D1FF"}
                            fillOpacity={0.2}
                        />
                        {!isWeirdMode && (
                            <Radar
                                name="Market Demand"
                                dataKey="B"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                fill="#F59E0B"
                                fillOpacity={0.1}
                            />
                        )}
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0F172A', borderColor: isWeirdMode ? '#a855f7' : '#1E293B', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isWeirdMode ? 'bg-purple-500' : 'bg-cyan-400'}`}></div>
                    <span className="text-slate-400">You</span>
                </div>
                {!isWeirdMode && (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-slate-400">Market Avg</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillRadar;