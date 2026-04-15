const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/fileUpload');

// Controller
const { dramatizeResume, viewResume, prophecyResume } = require('../controllers/resumeController');


// Multer Error Wrapper

const handleUpload = (req, res, next) => {
    uploadResume(req, res, (err) => {
        if (err) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'File too large. Maximum size is 5 MB.',
                });
            }
            // Custom filter errors (e.g., non-PDF)
            return res.status(400).json({
                error: err.message || 'File upload failed',
            });
        }
        next();
    });
};

// POST /api/resume/dramatize — Upload + parse + AI transform + save
router.post('/dramatize', protect, handleUpload, dramatizeResume);

// GET /api/resume/view — Retrieve the saved dramatic resume
router.get('/view', protect, viewResume);

// POST /api/resume/prophecy — The Oracle speaks (Public for accessibility)
router.post('/prophecy', handleUpload, prophecyResume);

module.exports = router;