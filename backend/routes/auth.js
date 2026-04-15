const express = require('express');
const router = express.Router();
const passport = require('passport');

// Middleware
const { protect } = require('../middleware/auth');

// Controller
const {
    registerUser,
    loginUser,
    getMe,
    googleCallback,
    addXp,
    getClassStats,
} = require('../controllers/authController');

// -----------------------------------------------------------------------------
// Local Auth Routes
// -----------------------------------------------------------------------------

// POST /api/auth/register — Create account with email + password
router.post('/register', registerUser);

// POST /api/auth/login — Authenticate with email + password
router.post('/login', loginUser);

// GET /api/auth/me — Fetch the current user's profile (requires valid JWT)
router.get('/me', protect, getMe);

// POST /api/auth/xp - Update user XP
router.post('/xp', protect, addXp);

// GET /api/auth/stats/classes - Get population counts for classes
router.get('/stats/classes', getClassStats);

// -----------------------------------------------------------------------------
// Google OAuth Routes
// -----------------------------------------------------------------------------

// GET /api/auth/google — Redirect user to Google's consent screen
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// GET /api/auth/google/callback — Google redirects here after consent
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/api/auth/google/failure',
    }),
    googleCallback
);

// GET /api/auth/google/failure — OAuth failure handler
router.get('/google/failure', (req, res) => {
    res.status(401).json({
        error: 'Google authentication failed. Please try again.',
    });
});

module.exports = router;