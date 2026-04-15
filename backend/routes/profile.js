const express = require('express');
const router = express.Router();

const { updateProfile, getProfile, getMyProfile } = require('../controllers/profileController');

// Middleware
const { protect } = require('../middleware/auth');

// GET /api/profile/me — Fetch current user's profile (Protected)
router.get('/me', protect, getMyProfile);

// PUT /api/profile — Update Profile (Protected)
router.put('/', protect, updateProfile);

// GET /api/profile/:email — Fetch profile by email (Public)
router.get('/:email', getProfile);

module.exports = router;