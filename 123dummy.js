const Interview = require('../models/Interview');
const { generateQuestions, evaluateSession } = require('../services/aiService');

// -----------------------------------------------------------------------------
// POST /api/interview/start — Start a new AI interview session
// -----------------------------------------------------------------------------
const startInterview = async (req, res) => {
    try {
        const { jobRole } = req.body;

        if (!jobRole) {
            return res.status(400).json({ error: 'jobRole is required' });
        }

        // ---------- Generate questions via Gemini ----------
        let questions;
        try {
            questions = await generateQuestions(jobRole);
        } catch (aiErr) {
            console.error('Gemini generateQuestions error:', aiErr.message);
            return res.status(502).json({
                error: 'Failed to generate interview questions. Please try again.',
            });
        }

        // ---------- Create interview document ----------
        const interview = await Interview.create({
            user: req.user._id,
            jobRole,
            questions,
            currentQuestionIndex: 0,
            status: 'in-progress',
        });

        res.status(201).json({
            message: 'Interview started successfully',
            interviewId: interview._id,
            jobRole: interview.jobRole,
            totalQuestions: questions.length,
            currentQuestion: {
                index: 0,
                text: questions[0],
            },
        });
    } catch (err) {
        console.error('startInterview error:', err.message);
        res.status(500).json({ error: 'Server error while starting interview' });
    }
};

// -----------------------------------------------------------------------------
// POST /api/interview/:id/answer — Submit an answer for the current question
// -----------------------------------------------------------------------------
const submitAnswer = async (req, res) => {
    try {
        const { answerText } = req.body;

        if (!answerText || !answerText.trim()) {
            return res.status(400).json({ error: 'answerText is required' });
        }

        // ---------- Find the interview ----------
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        // ---------- Security: only the interview owner can answer ----------
        if (interview.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied. This is not your interview.' });
        }

        // ---------- Guard: interview must still be in progress ----------
        if (interview.status === 'completed') {
            return res.status(400).json({
                error: 'This interview has already been completed',
                analysis: interview.analysis,
            });
        }

        // ---------- Store the answer ----------
        const currentIndex = interview.currentQuestionIndex;
        const currentQuestion = interview.questions[currentIndex];

        interview.answers.push({
            question: currentQuestion,
            userAnswer: answerText.trim(),
        });

        // ---------- Move to next question ----------
        const nextIndex = currentIndex + 1;
        interview.currentQuestionIndex = nextIndex;

        // ---------- Check if more questions ----------
        if (nextIndex < interview.questions.length) {
            // More questions remain
            await interview.save();

            return res.json({
                message: 'Answer recorded',
                interviewId: interview._id,
                totalQuestions: interview.questions.length,
                answeredSoFar: nextIndex,
                nextQuestion: {
                    index: nextIndex,
                    text: interview.questions[nextIndex],
                },
            });
        }

        // ---------- All questions answered — evaluate via Gemini ----------
        let evaluation;
        try {
            evaluation = await evaluateSession(interview.answers);
        } catch (aiErr) {
            console.error('Gemini evaluateSession error:', aiErr.message);

            // Still save answers even if evaluation fails
            interview.status = 'completed';
            await interview.save();

            return res.status(502).json({
                error: 'Interview answers saved, but AI evaluation failed. Please try again later.',
                interviewId: interview._id,
            });
        }

        // ---------- Store analysis and mark complete ----------
        interview.analysis = {
            overallScore: evaluation.score,
            overallFeedback: evaluation.feedback,
            questionBreakdown: evaluation.detailedAnalysis.map((item) => ({
                question: item.question,
                critique: item.critique,
                betterAnswer: item.improvement,
            })),
        };
        interview.status = 'completed';
        await interview.save();

        res.json({
            message: 'Interview completed',
            interviewId: interview._id,
            status: 'completed',
            analysis: interview.analysis,
        });
    } catch (err) {
        console.error('submitAnswer error:', err.message);
        res.status(500).json({ error: 'Server error while processing answer' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/interview/:id — Get interview details / results
// -----------------------------------------------------------------------------
const getInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('user', 'name email');

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        // Only the owner can view their interview
        if (interview.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied. This is not your interview.' });
        }

        res.json({ interview });
    } catch (err) {
        console.error('getInterview error:', err.message);
        res.status(500).json({ error: 'Server error while fetching interview' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/interview — Get all interviews for the logged-in user
// -----------------------------------------------------------------------------
const getMyInterviews = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

        const filter = { user: req.user._id };

        if (req.query.status && ['in-progress', 'completed'].includes(req.query.status)) {
            filter.status = req.query.status;
        }

        const [interviews, totalResults] = await Promise.all([
            Interview.find(filter)
                .select('jobRole status currentQuestionIndex analysis.overallScore createdAt')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Interview.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            interviews,
            totalPages,
            currentPage: page,
            totalResults,
        });
    } catch (err) {
        console.error('getMyInterviews error:', err.message);
        res.status(500).json({ error: 'Server error while fetching interviews' });
    }
};

module.exports = { startInterview, submitAnswer, getInterview, getMyInterviews };