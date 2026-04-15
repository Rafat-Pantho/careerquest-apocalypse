const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        // ---------- Step 1: Extract token from header ----------
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Split "Bearer <token>" and take the token part
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.',
                hint: 'Include an Authorization header: Bearer <your_token>',
            });
        }

        // ---------- Step 2: Verify the token ----------
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ---------- Step 3: Find the user from the token payload ----------
        // Exclude password from the query result for security
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                error: 'User belonging to this token no longer exists',
            });
        }

        // ---------- Step 4: Attach user and proceed ----------
        req.user = user;
        next();
    } catch (err) {
        // Handle specific JWT errors with clear messages
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired. Please log in again.' });
        }

        console.error('Auth middleware error:', err.message);
        res.status(401).json({ error: 'Not authorised' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};

module.exports = { protect, verifyAdmin };