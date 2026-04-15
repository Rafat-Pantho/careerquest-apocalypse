const express = require('express');
const router = express.Router();
const { generateRoast } = require('../services/aiService');
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');

// POST /api/roast
router.post('/', protect, async (req, res) => {
    try {
        const { applicationId, applicationTitle } = req.body;
        
        // Calculate Tier based on rejection stats
        const rejectionCount = await Application.countDocuments({ 
            user: req.user._id, 
            status: 'rejected' 
        });

        // Find the specific application to check if it was shortlisted at some point
        // (Assuming you mark things as shortlisted or have a history, 
        // if not we'll just use counts and title for now)
        const app = await Application.findById(applicationId);
        
        let tier = 1;
        if (rejectionCount >= 3) {
            tier = 3;
        } else if (app && app.status === 'rejected') {
            // Simplified logic: if they were rejected, check if they have more than 1 rejection
            if (rejectionCount >= 2) tier = 2;
        }

        const roast = await generateRoast(tier, { title: applicationTitle || 'The Bounty' });
        res.json({ roast, tier });

    } catch (err) {
        console.error("Roast Error:", err);
        res.status(500).json({ error: "Even the Roast-Bot is too disgusted to speak." });
    }
});

module.exports = router;
