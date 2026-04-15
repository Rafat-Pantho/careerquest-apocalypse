const express = require('express');
const router = express.Router();

// Middleware
// const { protect } = require('../middleware/auth'); //temporary commented

// Controller
const {
    startInterview,
    submitAnswer,
    getInterview,
    getMyInterviews,
} = require('../controllers/interviewController');

// All routes require authentication
// router.use(protect); //temporary comment

// POST   /api/interview/start       — Start a new AI interview session
router.post('/start', startInterview);

// POST   /api/interview/:id/answer  — Submit an answer for the current question
router.post('/:id/answer', submitAnswer);

// GET    /api/interview              — List all interviews for the logged-in user
router.get('/', getMyInterviews);

// GET    /api/interview/:id          — Get full interview details/results
router.get('/:id', getInterview);

module.exports = router;