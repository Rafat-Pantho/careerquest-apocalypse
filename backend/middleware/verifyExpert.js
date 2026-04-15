const { Bounty } = require('../models/Bounty');

const verifyExpert = async (req, res, next) => {
    try {
        // ---------- Fetch the target bounty ----------
        const bounty = await Bounty.findById(req.params.id);

        if (!bounty) {
            return res.status(404).json({ error: 'Bounty not found' });
        }

        // ---------- Expert gate check ----------
        // Only enforce the XP requirement for Expert-level bounties.
        // Beginner and Intermediate bounties pass through freely.
        if (bounty.difficulty === 'Expert' && req.user.xp < 500) {
            return res.status(403).json({
                error: 'You need more experience for this bounty',
                detail: `Expert bounties require at least 500 XP. You have ${req.user.xp} XP.`,
            });
        }

        // Attach the bounty to the request so the controller can reuse it
        req.bounty = bounty;
        next();
    } catch (err) {
        console.error('verifyExpert error:', err.message);
        res.status(500).json({ error: 'Server error during eligibility check' });
    }
};

module.exports = { verifyExpert };