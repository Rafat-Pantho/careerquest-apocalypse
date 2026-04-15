import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, VideoOff, Send, Loader, PlayCircle, Award, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/interview';

const InterviewDashboard = () => {
    // ── State ──────────────────────────────────────────────────────────
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [interviewId, setInterviewId] = useState(null);
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [expandedBreakdown, setExpandedBreakdown] = useState(null);

    // ── Webcam ─────────────────────────────────────────────────────────
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const chatEndRef = useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const startCamera = useCallback(async () => {
        setCameraError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraOn(true);
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError('Camera access denied. You can still continue without video.');
            setCameraOn(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraOn(false);
    }, []);

    // ── API helpers ────────────────────────────────────────────────────
    const getHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    // ── Start Interview ────────────────────────────────────────────────
    const handleStartInterview = async () => {
        setIsLoading(true);
        setMessages([]);
        setAnalysis(null);
        setAnsweredCount(0);

        // Start camera (non-blocking — interview continues even if denied)
        startCamera();

        try {
            const res = await fetch(`${API_BASE}/start`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ jobRole }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessages([{ sender: 'ai', text: data.error || 'Failed to start interview.' }]);
                setIsLoading(false);
                return;
            }

            setInterviewId(data.interviewId);
            setTotalQuestions(data.totalQuestions);
            setIsSessionActive(true);
            setMessages([{ sender: 'ai', text: data.currentQuestion.text }]);
        } catch (err) {
            console.error('startInterview error:', err);
            setMessages([{ sender: 'ai', text: 'Network error. Please check your connection and try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Submit Answer ──────────────────────────────────────────────────
    const handleSubmitAnswer = async () => {
        if (!inputText.trim() || isLoading || !interviewId) return;

        const userMsg = inputText.trim();
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setInputText('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE}/${interviewId}/answer`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ answerText: userMsg }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessages((prev) => [...prev, { sender: 'ai', text: data.error || 'Something went wrong.' }]);
                setIsLoading(false);
                return;
            }

            // More questions
            if (data.nextQuestion) {
                setAnsweredCount(data.answeredSoFar);
                setMessages((prev) => [...prev, { sender: 'ai', text: data.nextQuestion.text }]);
            }

            // Interview completed — analysis returned
            if (data.analysis) {
                setAnsweredCount(totalQuestions);
                setAnalysis(data.analysis);
                setIsSessionActive(false);
                stopCamera();
                setMessages((prev) => [
                    ...prev,
                    { sender: 'ai', text: 'Interview complete! Here are your results.' },
                ]);
            }
        } catch (err) {
            console.error('submitAnswer error:', err);
            setMessages((prev) => [...prev, { sender: 'ai', text: 'Network error while submitting answer.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitAnswer();
        }
    };

    const resetInterview = () => {
        setIsSessionActive(false);
        setInterviewId(null);
        setMessages([]);
        setAnalysis(null);
        setAnsweredCount(0);
        setInputText('');
        stopCamera();
    };

    // ── Score color helper ─────────────────────────────────────────────
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreGlow = (score) => {
        if (score >= 80) return 'shadow-emerald-500/30';
        if (score >= 60) return 'shadow-yellow-500/30';
        return 'shadow-red-500/30';
    };

    // ════════════════════════════════════════════════════════════════════
    // RENDER — Analysis Result Card
    // ════════════════════════════════════════════════════════════════════
    if (analysis) {
        return (
            <div className="flex flex-col h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                {/* Score Header */}
                <div className="p-6 text-center border-b border-yellow-500/20">
                    <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-yellow-500/40 shadow-xl ${getScoreGlow(analysis.overallScore)} mb-4`}>
                        <div className="text-center">
                            <p className={`text-4xl font-bold font-display ${getScoreColor(analysis.overallScore)}`}>{analysis.overallScore}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">/100</p>
                        </div>
                    </div>
                    <h3 className="text-lg font-display font-bold text-yellow-400 mb-1">Interview Complete</h3>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">{analysis.overallFeedback}</p>
                </div>

                {/* Question Breakdown */}
                <div className="p-4 space-y-3">
                    <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Award size={14} />
                        Detailed Breakdown
                    </h4>
                    {analysis.questionBreakdown.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/60 border border-white/5 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setExpandedBreakdown(expandedBreakdown === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition"
                            >
                                <span className="text-xs text-slate-200 font-medium flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="line-clamp-1">{item.question}</span>
                                </span>
                                {expandedBreakdown === idx ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                            </button>
                            {expandedBreakdown === idx && (
                                <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                                    <div className="flex items-start gap-2">
                                        <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-0.5">Critique</p>
                                            <p className="text-xs text-slate-300 leading-relaxed">{item.critique}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-0.5">Better Answer</p>
                                            <p className="text-xs text-slate-300 leading-relaxed">{item.betterAnswer}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Restart Button */}
                <div className="p-4 border-t border-white/5 mt-auto">
                    <button
                        onClick={resetInterview}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                    >
                        <PlayCircle size={16} />
                        Start New Interview
                    </button>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════
    // RENDER — Intro Screen (before start)
    // ════════════════════════════════════════════════════════════════════
    if (!isSessionActive && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] p-6 text-center">
                {/* Camera Preview */}
                <div className="w-48 h-36 rounded-xl border-2 border-yellow-500/40 bg-black/60 mb-6 overflow-hidden relative flex items-center justify-center shadow-lg shadow-yellow-500/10">
                    <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`} />
                    {!cameraOn && (
                        <div className="text-center">
                            <Video size={32} className="text-slate-500 mx-auto mb-1" />
                            <p className="text-[10px] text-slate-500">Camera Preview</p>
                        </div>
                    )}
                </div>

                {cameraError && (
                    <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-4 max-w-sm">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        <p className="text-[10px]">{cameraError}</p>
                    </div>
                )}

                <h3 className="text-lg font-display font-bold text-white mb-1">AI Mock Interview</h3>
                <p className="text-xs text-slate-400 mb-6 max-w-xs">
                    Choose a role and begin. The AI will ask you 5 questions, then evaluate your performance.
                </p>

                {/* Role Selector */}
                <div className="mb-4 w-full max-w-xs">
                    <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1.5 block text-left">Target Role</label>
                    <input
                        type="text"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder="e.g. Frontend Developer"
                        className="w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-500/50 transition"
                    />
                </div>

                <button
                    onClick={handleStartInterview}
                    disabled={isLoading || !jobRole.trim()}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2.5 px-8 rounded-xl text-sm transition shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                    Start Interview
                </button>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════
    // RENDER — Active Interview Session
    // ════════════════════════════════════════════════════════════════════
    return (
        <div className="flex flex-col md:flex-row h-[500px] w-full">
            {/* Left: Video Feed */}
            <div className="w-full md:w-56 bg-black/40 border-r border-white/5 p-4 flex flex-col items-center justify-between flex-shrink-0">
                {/* Webcam */}
                <div className="w-full aspect-video rounded-xl border-2 border-yellow-500/40 bg-black/80 overflow-hidden relative shadow-lg shadow-yellow-500/10">
                    <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`} />
                    {!cameraOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <VideoOff size={28} className="text-slate-600 mb-1" />
                            <p className="text-[9px] text-slate-600">No Camera</p>
                        </div>
                    )}
                    {cameraOn && (
                        <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest text-white animate-pulse">
                            ● LIVE
                        </div>
                    )}
                </div>

                {cameraError && (
                    <div className="mt-2 flex items-center gap-1 text-yellow-400 text-[9px]">
                        <AlertTriangle size={10} />
                        <span>Camera unavailable</span>
                    </div>
                )}

                {/* Progress */}
                <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-yellow-400 font-bold">{answeredCount}/{totalQuestions}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: totalQuestions ? `${(answeredCount / totalQuestions) * 100}%` : '0%' }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 text-center font-mono">{jobRole}</p>
                </div>

                {/* Camera Toggle */}
                <button
                    onClick={cameraOn ? stopCamera : startCamera}
                    className={`mt-3 p-2 rounded-full text-xs flex items-center gap-1.5 transition border ${cameraOn
                        ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                        : 'bg-slate-800 border-white/10 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    {cameraOn ? <VideoOff size={14} /> : <Video size={14} />}
                </button>
            </div>

            {/* Right: Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed shadow-md ${msg.sender === 'ai'
                                    ? 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-none'
                                    : 'bg-yellow-600 text-white rounded-tr-none'
                                    }`}
                            >
                                {msg.sender === 'ai' && (
                                    <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">AI Interviewer</p>
                                )}
                                <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800/80 border border-white/5 px-4 py-3 rounded-xl rounded-tl-none shadow-md">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                {isSessionActive && (
                    <div className="p-3 border-t border-white/5 bg-slate-900/40">
                        <div className="flex gap-2">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your answer... (Enter to send)"
                                rows={2}
                                className="flex-1 bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-500/50 resize-none transition"
                            />
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={isLoading || !inputText.trim()}
                                className="self-end bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold p-2.5 rounded-lg transition shadow-lg shadow-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                {isLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewDashboard;