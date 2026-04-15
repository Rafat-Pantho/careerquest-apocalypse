const User = require('../models/User');
const { Bounty } = require('../models/Bounty');
const Application = require('../models/Application');

// =============================================================================
// USER MANAGEMENT
// =============================================================================

// -----------------------------------------------------------------------------
// GET /api/admin/users — Fetch all users with pagination & filters
// -----------------------------------------------------------------------------
const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const { role, isVerified } = req.query;

        // Build dynamic filter
        const filter = {};

        if (role && ['student', 'job_recruiter', 'tuition_recruiter', 'admin'].includes(role)) {
            filter.role = role;
        }

        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }

        const [users, totalResults] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            users,
            totalPages,
            currentPage: page,
            totalResults,
        });
    } catch (err) {
        console.error('getAllUsers error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// -----------------------------------------------------------------------------
// PUT /api/admin/users/:id/verify — Toggle isVerified status of a user
// -----------------------------------------------------------------------------
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isVerified = !user.isVerified;
        await user.save();

        res.json({
            message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
            user,
        });
    } catch (err) {
        console.error('verifyUser error:', err.message);
        res.status(500).json({ error: 'Failed to update user verification status' });
    }
};

// -----------------------------------------------------------------------------
// DELETE /api/admin/users/:id — Delete a user and their associated posts
// -----------------------------------------------------------------------------
const deleteUser = async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot delete your own admin account' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete all bounties posted by this user
        await Bounty.deleteMany({ postedBy: user._id });

        // Delete all applications submitted by this user
        await Application.deleteMany({ applicant: user._id });

        // Remove user from applicants arrays in other bounties
        await Bounty.updateMany(
            { applicants: user._id },
            { $pull: { applicants: user._id } }
        );

        // Delete the user
        await User.findByIdAndDelete(user._id);

        res.json({ message: 'User and associated data deleted successfully' });
    } catch (err) {
        console.error('deleteUser error:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// =============================================================================
// POST (JOB / TUITION) MANAGEMENT
// =============================================================================

// -----------------------------------------------------------------------------
// GET /api/admin/posts — Fetch all posts with pagination
// -----------------------------------------------------------------------------
const getAllPosts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const { type, isVerified } = req.query;

        const filter = {};

        if (type && ['job', 'tuition'].includes(type)) {
            filter.type = type;
        }

        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }

        const [posts, totalResults] = await Promise.all([
            Bounty.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('postedBy', 'name email role isVerified'),
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
        console.error('getAllPosts error:', err.message);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// -----------------------------------------------------------------------------
// PUT /api/admin/posts/:id/verify — Toggle isVerified status of a post
// -----------------------------------------------------------------------------
const verifyPost = async (req, res) => {
    try {
        const post = await Bounty.findById(req.params.id).populate('postedBy', 'name email');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.isVerified = !post.isVerified;
        await post.save();

        res.json({
            message: `Post ${post.isVerified ? 'verified' : 'unverified'} successfully`,
            post,
        });
    } catch (err) {
        console.error('verifyPost error:', err.message);
        res.status(500).json({ error: 'Failed to update post verification status' });
    }
};

// -----------------------------------------------------------------------------
// DELETE /api/admin/posts/:id — Delete a post
// -----------------------------------------------------------------------------
const deletePost = async (req, res) => {
    try {
        const post = await Bounty.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete associated applications
        await Application.deleteMany({ bounty: post._id });

        await Bounty.findByIdAndDelete(post._id);

        res.json({ message: 'Post and associated applications deleted successfully' });
    } catch (err) {
        console.error('deletePost error:', err.message);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

module.exports = {
    getAllUsers,
    verifyUser,
    deleteUser,
    getAllPosts,
    verifyPost,
    deletePost,
};