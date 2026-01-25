import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const OraclePage = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('consult'); // consult, interview, resume
  
  // Error state
  const [error, setError] = useState(null);
  
  // Consult state
  const [query, setQuery] = useState('');
  const [prophecy, setProphecy] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Interview state
  const [interviewTypes, setInterviewTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [interviewSummary, setInterviewSummary] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  
  // Resume review state
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [resumeReview, setResumeReview] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    fetchInterviewTypes();
  }, []);

  const fetchInterviewTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/oracle/interview/types`);
      setInterviewTypes(response.data.types);
    } catch (err) {
      console.error('Failed to fetch interview types:', err);
    }
  };

  const consultOracle = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setProphecy(null);
    try {
      const response = await axios.post(`${API_URL}/oracle/consult`, { query });
      if (response.data.success) {
        setProphecy(response.data.prophecy);
      } else {
        setError(response.data.message || 'The Oracle is silent...');
      }
    } catch (err) {
      console.error('Oracle consult error:', err);
      setError(err.response?.data?.message || 'The Oracle is clouded by dark mists. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    if (!selectedType) return;
    
    setInterviewLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/oracle/interview/start`,
        { interviewType: selectedType, jobRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setInterview(response.data.interview);
        setCurrentQuestionIndex(0);
        setEvaluations([]);
        setInterviewSummary(null);
      } else {
        setError(response.data.message || 'Failed to start interview');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.response?.data?.message || 'The Oracle refuses to begin the trial.');
    } finally {
      setInterviewLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !interview) return;
    
    setInterviewLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/oracle/interview/answer`,
        {
          question: interview.questions[currentQuestionIndex],
          answer,
          questionNumber: currentQuestionIndex + 1,
          totalQuestions: interview.totalQuestions,
          jobRole
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEvaluations([...evaluations, {
        question: interview.questions[currentQuestionIndex],
        answer,
        evaluation: response.data.evaluation
      }]);
      
      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
      } else {
        // Get final summary
        await getInterviewSummary();
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  const getInterviewSummary = async () => {
    setInterviewLoading(true);
    try {
      const allAnswers = [...evaluations, {
        question: interview.questions[currentQuestionIndex],
        answer
      }];
      const allScores = [...evaluations.map(e => e.evaluation.score), 7]; // Placeholder for last
      
      const response = await axios.post(
        `${API_URL}/oracle/interview/summary`,
        {
          answers: allAnswers,
          scores: allScores,
          interviewType: interview.type,
          jobRole
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInterviewSummary(response.data.summary);
    } catch (err) {
      console.error('Failed to get summary:', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  const reviewResume = async () => {
    if (!resumeText.trim()) return;
    
    setResumeLoading(true);
    setError(null);
    setResumeReview(null);
    try {
      const response = await axios.post(
        `${API_URL}/oracle/resume-review`,
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setResumeReview(response.data.review);
      } else {
        setError(response.data.message || 'Failed to review resume');
      }
    } catch (err) {
      console.error('Failed to review resume:', err);
      setError(err.response?.data?.message || 'The Oracle cannot read your scroll.');
    } finally {
      setResumeLoading(false);
    }
  };

  const resetInterview = () => {
    setInterview(null);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setEvaluations([]);
    setInterviewSummary(null);
  };

  const tabs = [
    { id: 'consult', name: 'Seek Wisdom', icon: '🔮' },
    { id: 'interview', name: 'Mock Trial', icon: '⚔️' },
    { id: 'resume', name: 'Scroll Review', icon: '📜' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-cinzel text-mystic-400 mb-2">The Oracle of Judgment</h1>
          <p className="text-parchment-400">Face the ancient one... if you dare.</p>
        </motion.div>

        {/* Oracle Animation */}
        <motion.div 
          className="relative mx-auto w-32 h-32 mb-8"
          animate={{ 
            scale: [1, 1.05, 1],
            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-mystic-600 to-purple-600 blur-xl opacity-50" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-mystic-500 to-purple-700 flex items-center justify-center">
            <span className="text-5xl">🔮</span>
          </div>
          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-mystic-400 rounded-full"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: `${30 + i * 10}px 0px`
              }}
            />
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(null); }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-mystic-600 text-white shadow-lg shadow-mystic-600/30'
                  : 'bg-dungeon-700 text-parchment-300 hover:bg-dungeon-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-center"
          >
            <span className="mr-2">⚠️</span>
            {error}
          </motion.div>
        )}

        {/* Consult Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'consult' && (
            <motion.div
              key="consult"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="dungeon-card bg-dungeon-800/50 backdrop-blur mb-8">
                <h2 className="text-xl font-cinzel text-mystic-300 mb-4">Ask the Oracle</h2>
                <form onSubmit={consultOracle}>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Oh great Oracle, should I learn Rust or Go? What path leads to senior engineer?"
                    className="w-full h-32 bg-dungeon-900 border border-dungeon-600 rounded-lg p-4 text-parchment-100 placeholder-parchment-500 focus:border-mystic-500 focus:outline-none mb-4 resize-none"
                  />
                  <Button 
                    type="submit"
                    variant="mystic" 
                    loading={loading} 
                    className="w-full"
                    disabled={!query.trim()}
                  >
                    <span className="mr-2">🔮</span> Seek the Oracle's Wisdom
                  </Button>
                </form>
              </div>

              {prophecy && (
                <motion.div 
                  className="dungeon-card border-mystic-500/50 bg-mystic-900/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="text-mystic-300 font-cinzel mb-3 flex items-center gap-2">
                    <span>✨</span> The Prophecy
                  </h3>
                  <p className="text-lg text-parchment-100 italic leading-relaxed">{prophecy}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Interview Tab */}
          {activeTab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {!user ? (
                <div className="dungeon-card text-center">
                  <p className="text-parchment-400 mb-4">You must be logged in to face the Trial.</p>
                  <Button variant="mystic" onClick={() => window.location.href = '/login'}>
                    Login to Continue
                  </Button>
                </div>
              ) : !interview ? (
                <div className="dungeon-card bg-dungeon-800/50">
                  <h2 className="text-xl font-cinzel text-mystic-300 mb-6">Choose Your Trial</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {interviewTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-lg text-left transition-all ${
                          selectedType === type.id
                            ? 'bg-mystic-600/30 border-2 border-mystic-500'
                            : 'bg-dungeon-700 border-2 border-transparent hover:border-dungeon-500'
                        }`}
                      >
                        <h3 className="font-cinzel text-parchment-100 mb-1">{type.name}</h3>
                        <p className="text-sm text-parchment-400">{type.description}</p>
                        <p className="text-xs text-mystic-400 mt-2">{type.questionCount} questions available</p>
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="block text-parchment-300 mb-2">Target Role (Optional)</label>
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g., Frontend Developer, Data Scientist"
                      className="w-full bg-dungeon-900 border border-dungeon-600 rounded-lg p-3 text-parchment-100 focus:border-mystic-500"
                    />
                  </div>

                  <Button 
                    variant="mystic" 
                    onClick={startInterview}
                    loading={interviewLoading}
                    disabled={!selectedType}
                    className="w-full"
                  >
                    <span className="mr-2">⚔️</span> Begin the Trial
                  </Button>
                </div>
              ) : interviewSummary ? (
                <motion.div 
                  className="dungeon-card bg-dungeon-800/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-cinzel text-mystic-300 mb-2">Trial Complete</h2>
                    <p className="text-4xl font-bold text-amber-400">{interviewSummary.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-dungeon-900 rounded-lg p-4 text-center">
                      <p className="text-parchment-400 text-sm">Survival Chance</p>
                      <p className="text-3xl font-bold text-blood-400">{interviewSummary.survivalChance}</p>
                    </div>
                    <div className="bg-dungeon-900 rounded-lg p-4 text-center">
                      <p className="text-parchment-400 text-sm">Score</p>
                      <p className="text-3xl font-bold text-mystic-400">
                        {interviewSummary.stats.averageScore}/10
                      </p>
                    </div>
                  </div>

                  <div className="bg-mystic-900/20 border border-mystic-600/30 rounded-lg p-4 mb-6">
                    <h3 className="text-mystic-300 font-cinzel mb-2">The Oracle's Verdict</h3>
                    <p className="text-parchment-200 italic">{interviewSummary.overallVerdict}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-green-400 font-medium mb-2">✅ Strengths</h4>
                      <ul className="space-y-1">
                        {interviewSummary.topStrengths?.map((s, i) => (
                          <li key={i} className="text-parchment-300 text-sm">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-blood-400 font-medium mb-2">⚠️ Improve</h4>
                      <ul className="space-y-1">
                        {interviewSummary.areasToImprove?.map((a, i) => (
                          <li key={i} className="text-parchment-300 text-sm">• {a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mb-6">
                    <h4 className="text-amber-400 font-medium mb-2">💡 Final Wisdom</h4>
                    <p className="text-parchment-200">{interviewSummary.finalWisdom}</p>
                  </div>

                  <Button variant="mystic" onClick={resetInterview} className="w-full">
                    Face Another Trial
                  </Button>
                </motion.div>
              ) : (
                <div className="dungeon-card bg-dungeon-800/50">
                  {/* Interview Introduction */}
                  {currentQuestionIndex === 0 && evaluations.length === 0 && (
                    <motion.div 
                      className="mb-6 p-4 bg-mystic-900/20 border border-mystic-600/30 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-mystic-300 italic">{interview.introduction}</p>
                    </motion.div>
                  )}

                  {/* Progress */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-mystic-300 font-cinzel">{interview.typeName}</h3>
                    <span className="text-parchment-400">
                      Question {currentQuestionIndex + 1} of {interview.totalQuestions}
                    </span>
                  </div>

                  <div className="w-full bg-dungeon-900 rounded-full h-2 mb-6">
                    <div 
                      className="bg-mystic-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestionIndex + 1) / interview.totalQuestions) * 100}%` }}
                    />
                  </div>

                  {/* Current Question */}
                  <motion.div 
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <p className="text-xl text-parchment-100 mb-4 font-medium">
                      {interview.questions[currentQuestionIndex]}
                    </p>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Speak your answer, mortal..."
                      className="w-full h-40 bg-dungeon-900 border border-dungeon-600 rounded-lg p-4 text-parchment-100 focus:border-mystic-500 resize-none"
                    />
                  </motion.div>

                  {/* Last Evaluation */}
                  {evaluations.length > 0 && (
                    <motion.div 
                      className="mb-6 p-4 bg-dungeon-900 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-parchment-400 text-sm">Previous Answer Score</span>
                        <span className={`text-xl font-bold ${
                          evaluations[evaluations.length - 1].evaluation.score >= 7 
                            ? 'text-green-400' 
                            : evaluations[evaluations.length - 1].evaluation.score >= 5 
                            ? 'text-amber-400' 
                            : 'text-blood-400'
                        }`}>
                          {evaluations[evaluations.length - 1].evaluation.score}/10
                        </span>
                      </div>
                      <p className="text-parchment-300 text-sm italic">
                        {evaluations[evaluations.length - 1].evaluation.verdict}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-4">
                    <Button 
                      variant="danger" 
                      onClick={resetInterview}
                      className="flex-1"
                    >
                      Abandon Trial
                    </Button>
                    <Button 
                      variant="mystic" 
                      onClick={submitAnswer}
                      loading={interviewLoading}
                      disabled={!answer.trim()}
                      className="flex-1"
                    >
                      {currentQuestionIndex < interview.questions.length - 1 ? 'Submit & Continue' : 'Complete Trial'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Resume Review Tab */}
          {activeTab === 'resume' && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {!user ? (
                <div className="dungeon-card text-center">
                  <p className="text-parchment-400 mb-4">You must be logged in for Scroll Review.</p>
                  <Button variant="mystic" onClick={() => window.location.href = '/login'}>
                    Login to Continue
                  </Button>
                </div>
              ) : (
                <div className="dungeon-card bg-dungeon-800/50">
                  <h2 className="text-xl font-cinzel text-mystic-300 mb-4">Submit Your Scroll</h2>
                  <p className="text-parchment-400 text-sm mb-6">
                    Paste your resume text below for the Oracle's brutal but fair judgment.
                  </p>

                  <div className="mb-4">
                    <label className="block text-parchment-300 mb-2">Target Role (Optional)</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Product Manager"
                      className="w-full bg-dungeon-900 border border-dungeon-600 rounded-lg p-3 text-parchment-100 focus:border-mystic-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-parchment-300 mb-2">Resume Text</label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      className="w-full h-64 bg-dungeon-900 border border-dungeon-600 rounded-lg p-4 text-parchment-100 placeholder-parchment-500 focus:border-mystic-500 focus:outline-none resize-none font-mono text-sm"
                    />
                  </div>

                  <Button 
                    variant="mystic" 
                    onClick={reviewResume}
                    loading={resumeLoading}
                    disabled={!resumeText.trim()}
                    className="w-full"
                  >
                    <span className="mr-2">📜</span> Submit for Judgment
                  </Button>
                </div>
              )}

              {resumeReview && (
                <motion.div 
                  className="dungeon-card bg-dungeon-800/50 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-cinzel text-mystic-300 mb-2">The Oracle's Judgment</h3>
                    <div className="flex justify-center gap-6">
                      <div>
                        <p className="text-parchment-400 text-sm">Grade</p>
                        <p className={`text-4xl font-bold ${
                          resumeReview.overallGrade === 'A' ? 'text-green-400' :
                          resumeReview.overallGrade === 'B' ? 'text-blue-400' :
                          resumeReview.overallGrade === 'C' ? 'text-amber-400' :
                          'text-blood-400'
                        }`}>{resumeReview.overallGrade}</p>
                      </div>
                      <div>
                        <p className="text-parchment-400 text-sm">Survival Chance</p>
                        <p className="text-4xl font-bold text-blood-400">{resumeReview.survivalChance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-mystic-900/20 border border-mystic-600/30 rounded-lg p-4 mb-6">
                    <p className="text-parchment-200 italic text-center">{resumeReview.dramaticVerdict}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-green-400 font-medium mb-3">✅ Strengths</h4>
                      <ul className="space-y-2">
                        {resumeReview.strengths?.map((s, i) => (
                          <li key={i} className="text-parchment-300 text-sm flex items-start gap-2">
                            <span className="text-green-500">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-blood-400 font-medium mb-3">❌ Weaknesses</h4>
                      <ul className="space-y-2">
                        {resumeReview.weaknesses?.map((w, i) => (
                          <li key={i} className="text-parchment-300 text-sm flex items-start gap-2">
                            <span className="text-blood-500">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {resumeReview.specificFixes?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-amber-400 font-medium mb-3">🔧 Specific Fixes</h4>
                      <div className="space-y-3">
                        {resumeReview.specificFixes.map((fix, i) => (
                          <div key={i} className="bg-dungeon-900 rounded-lg p-3">
                            <p className="text-blood-300 text-sm line-through mb-1">{fix.original}</p>
                            <p className="text-green-300 text-sm">→ {fix.improved}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                    <h4 className="text-amber-400 font-medium mb-2">💡 Final Advice</h4>
                    <p className="text-parchment-200">{resumeReview.finalAdvice}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default OraclePage;
