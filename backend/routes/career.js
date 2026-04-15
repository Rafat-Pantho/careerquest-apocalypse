const express = require('express');
const router = express.Router();

// Mock data for career roadmap
router.get('/roadmap', (req, res) => {
    res.json([
        { id: 1, title: 'Profile Completion', status: 'completed' },
        { id: 2, title: 'Skill Assessment', status: 'in-progress' },
        { id: 3, title: 'First Project', status: 'pending' },
        { id: 4, title: 'Internship Ready', status: 'pending' }
    ]);
});

module.exports = router;