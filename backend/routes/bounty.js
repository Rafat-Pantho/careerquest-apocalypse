const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middleware/auth');

// Controller
const { createPost, getMyPosts, getBounties, completeBounty } = require('../controllers/bountyController');


// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// GET /api/bounties — Requires auth so class-based filtering works via req.user
router.get('/', protect, getBounties);

// GET /api/bounties/my — Fetch current user's own posts
router.get('/my', protect, getMyPosts);

// POST /api/bounties — Create a new post (role-gated logic inside controller)
router.post('/', protect, createPost);

// PATCH /api/bounties/:id/complete — Mark as closed and award creator XP
router.patch('/:id/complete', protect, completeBounty);

module.exports = router;