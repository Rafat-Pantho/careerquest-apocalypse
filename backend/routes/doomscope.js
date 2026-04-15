const express = require('express');
const router = express.Router();
const { generateDoomScope } = require('../services/aiService');
const { protect } = require('../middleware/auth');

let cachedDoom = null;
let lastFetch = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// GET /api/doom-scope
router.get('/', protect, async (req, res) => {
    try {
        const now = Date.now();
        if (cachedDoom && (now - lastFetch < CACHE_DURATION)) {
            return res.json(cachedDoom);
        }

        const title = req.user.title || 'Student';
        const scope = await generateDoomScope(title);
        
        cachedDoom = scope;
        lastFetch = now;
        
        res.json(scope);
    } catch (err) {
        console.error("Doomscope Error:", err);
        
        // If we have a cache even if old, use it on error
        if (cachedDoom) {
            return res.json(cachedDoom);
        }

        res.status(500).json({ error: "The void refused your query." });
    }
});


module.exports = router;
