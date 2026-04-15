const express = require('express');
const router = express.Router();
const { protect, verifyAdmin } = require('../middleware/auth');
const {
    getAllUsers,
    verifyUser,
    deleteUser,
    getAllPosts,
    verifyPost,
    deletePost,
} = require('../controllers/adminController');

// All routes require authentication + admin role
router.use(protect, verifyAdmin);

// --- User Management ---
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);

// --- Post (Job/Tuition) Management ---
router.get('/posts', getAllPosts);
router.put('/posts/:id/verify', verifyPost);
router.delete('/posts/:id', deletePost);

module.exports = router;