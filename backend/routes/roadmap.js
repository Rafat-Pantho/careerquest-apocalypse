const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middleware/auth');

// Controller
const { getRoadmap, completeMilestone } = require('../controllers/roadmapController');

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// GET  /api/roadmap — Retrieve all milestones with user-specific status
router.get('/', protect, getRoadmap);

// POST /api/roadmap/:id/complete — Mark the active milestone as done
router.post('/:id/complete', protect, completeMilestone);

module.exports = router;