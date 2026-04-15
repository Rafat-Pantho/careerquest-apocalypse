const express = require('express');
const router = express.Router();

// Mock data for jobs/bounties
router.get('/bounties', (req, res) => {
    res.json([
        { id: 1, title: 'HSC Math Tutor', rate: '৳500/hr', reqs: ['Math', 'Bangla Medium'] },
        { id: 2, title: 'Frontend Developer (React)', rate: '৳30,000/mo', reqs: ['React', 'Tailwind'] },
        { id: 3, title: 'Physics Consultant', rate: '৳1000/hr', reqs: ['Physics', 'English Version'] }
    ]);
});

module.exports = router;