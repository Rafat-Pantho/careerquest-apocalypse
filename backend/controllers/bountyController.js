const { Bounty } = require('../models/Bounty');

// POST /api/bounties — Any authenticated user can create a bounty or tuition post
const createPost = async (req, res) => {
    try {
        const { title, description, reward, difficulty, type, characterClass } = req.body;

        if (!title || !type) {
            return res.status(400).json({ error: 'Title and type are required' });
        }

        const bounty = await Bounty.create({
            title,
            description: description || '',
            reward: reward || 0,
            difficulty: difficulty || 'Beginner',
            type,
            postedBy: req.user._id,
            characterClass: characterClass || req.user.characterClass || 'Any',
        });

        res.status(201).json({
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} post created successfully`,
            bounty,
        });
    } catch (err) {
        console.error('createPost error:', err.message);
        res.status(500).json({ error: 'Server error while creating post' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/bounties/my — Fetch posts created by the logged-in user
// -----------------------------------------------------------------------------
const getMyPosts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

        const filter = { postedBy: req.user._id };

        // Optional type filter
        if (req.query.type && ['job', 'tuition'].includes(req.query.type)) {
            filter.type = req.query.type;
        }

        const [posts, totalResults] = await Promise.all([
            Bounty.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Bounty.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            posts,
            totalPages,
            currentPage: page,
            totalResults,
        });
    } catch (err) {
        console.error('getMyPosts error:', err.message);
        res.status(500).json({ error: 'Server error while fetching your posts' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/bounties — Search & Pagination
// -----------------------------------------------------------------------------
const getBounties = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const { difficulty, minReward } = req.query;

        const filter = { status: 'Open' };

        // --- characterClass filter: user only sees bounties for their class OR 'Any' ---
        const userClass = req.user?.characterClass;
        if (userClass && userClass !== 'None') {
            filter.$or = [
                { characterClass: userClass },
                { characterClass: 'Any' }
            ];
        }

        if (difficulty) {
            const validLevels = ['Beginner', 'Intermediate', 'Expert'];
            if (validLevels.includes(difficulty)) filter.difficulty = difficulty;
        }

        if (minReward) {
            const parsed = parseFloat(minReward);
            if (!isNaN(parsed)) filter.reward = { $gte: parsed };
        }

        const [bounties, totalResults] = await Promise.all([
            Bounty.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('postedBy', 'name email'),
            Bounty.countDocuments(filter),
        ]);

        res.json({
            bounties,
            totalPages: Math.ceil(totalResults / limit),
            currentPage: page,
            totalResults,
        });
    } catch (err) {
        console.error('getBounties error:', err.message);
        res.status(500).json({ error: 'Server error while fetching bounties' });
    }
};


// -----------------------------------------------------------------------------
// PATCH /api/bounties/:id/complete — Mark as closed and award creator XP
// -----------------------------------------------------------------------------
const completeBounty = async (req, res) => {
    try {
        const { id } = req.params;
        const User = require('../models/User');

        const bounty = await Bounty.findById(id);
        if (!bounty) {
            return res.status(404).json({ error: 'Bounty not found' });
        }

        if (bounty.status === 'Closed') {
            return res.status(400).json({ error: 'Bounty already completed' });
        }

        // Mark as closed
        bounty.status = 'Closed';
        await bounty.save();

        // Award 25% XP to creator
        const creatorXp = Math.floor(bounty.reward * 0.25);
        if (creatorXp > 0 && bounty.postedBy) {
            await User.findByIdAndUpdate(bounty.postedBy, {
                $inc: { xp: creatorXp }
            });
        }

        res.json({ message: 'Bounty cleared successfully', creatorAwardedXp: creatorXp });
    } catch (err) {
        console.error('completeBounty error:', err.message);
        res.status(500).json({ error: 'Server error while completing bounty' });
    }
};

module.exports = { createPost, getMyPosts, getBounties, completeBounty };