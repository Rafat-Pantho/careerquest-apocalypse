const jwt = require('jsonwebtoken');
const User = require('../models/User');

// -----------------------------------------------------------------------------
// Helper — Generate a signed JWT for a given user ID
// -----------------------------------------------------------------------------
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// -----------------------------------------------------------------------------
// POST /api/auth/register
// -----------------------------------------------------------------------------
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // ---------- Validation ----------
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Please provide name, email, and password',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters',
            });
        }

        // ---------- Check for existing email ----------
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                error: 'An account with this email already exists',
            });
        }

        // ---------- Validate role ----------
        const validRoles = ['student', 'job_recruiter', 'tuition_recruiter'];
        const assignedRole = role && validRoles.includes(role) ? role : 'student';

        // ---------- Create user ----------
        // Password hashing happens automatically in the pre-save hook
        const userData = {
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
        };

        if (req.body.characterClass) {
            userData.characterClass = req.body.characterClass;
        }

        // Attach recruiter profile if registering as a recruiter
        if (assignedRole === 'job_recruiter' && req.body.recruiterProfile) {
            userData.recruiterProfile = {
                companyName: req.body.recruiterProfile.companyName || '',
                position: req.body.recruiterProfile.position || '',
                companyWebsite: req.body.recruiterProfile.companyWebsite || '',
                industry: req.body.recruiterProfile.industry || '',
            };
        }
        if (assignedRole === 'tuition_recruiter' && req.body.recruiterProfile) {
            userData.recruiterProfile = {
                parentName: req.body.recruiterProfile.parentName || '',
                address: req.body.recruiterProfile.address || '',
                relation: req.body.recruiterProfile.relation || '',
            };
        }

        const user = await User.create(userData);

        // ---------- Generate token ----------
        const token = generateToken(user._id);

        // ---------- Respond (exclude password) ----------
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                avatarUrl: user.avatarUrl,
                characterClass: user.characterClass,
            },
        });
    } catch (err) {
        console.error('registerUser error:', err.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// -----------------------------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------------------------
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ---------- Validation ----------
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password',
            });
        }

        // ---------- Find user ----------
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // ---------- Check if this is a Google-only account ----------
        if (!user.password) {
            return res.status(401).json({
                error: 'This account uses Google sign-in. Please log in with Google.',
            });
        }

        // ---------- Compare password ----------
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // ---------- Generate token ----------
        const token = generateToken(user._id);

        // ---------- Respond ----------
        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                avatarUrl: user.avatarUrl,
                characterClass: user.characterClass,
            },
        });
    } catch (err) {
        console.error('loginUser error:', err.message);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/auth/me — Get current user profile
// -----------------------------------------------------------------------------
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('getMe error:', err.message);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/auth/google/callback — Google OAuth Callback Handler
// -----------------------------------------------------------------------------
const googleCallback = (req, res) => {
    try {
        const token = generateToken(req.user._id);

        // Redirect to the frontend with the token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?token=${token}`);
    } catch (err) {
        console.error('googleCallback error:', err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
};

const addXp = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid XP amount' });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { xp: amount } },
            { new: true }
        ).select('-password');

        res.json({ xp: user.xp, message: `+${amount} XP earned` });
    } catch (err) {
        res.status(500).json({ error: 'Could not update XP' });
    }
};

const getClassStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $group: { _id: "$characterClass", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Format them nicely
        const formatted = {};
        stats.forEach(s => {
            if (s._id) {
                formatted[s._id] = s.count;
            }
        });
        
        res.json(formatted);
    } catch (err) {
        console.error('getClassStats error:', err);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
};

module.exports = { registerUser, loginUser, getMe, googleCallback, addXp, getClassStats };