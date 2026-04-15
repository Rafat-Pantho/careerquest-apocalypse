const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ---------- Ensure upload directory exists ----------
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------- Disk Storage Configuration ----------
const storage = multer.diskStorage({
    // Where to save the file
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    // How to name the file — includes userId + timestamp to avoid collisions
    filename: (req, file, cb) => {
        const userId = req.user ? req.user._id.toString() : 'anonymous';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname); // preserves .pdf
        cb(null, `resume-${userId}-${timestamp}${ext}`);
    },
});

// ---------- File Filter — PDF Only ----------
const fileFilter = (req, file, cb) => {
    // Check both MIME type and extension for safety
    const isPdf =
        file.mimetype === 'application/pdf' &&
        path.extname(file.originalname).toLowerCase() === '.pdf';

    if (isPdf) {
        cb(null, true); // accept the file
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// ---------- Build the Multer instance ----------
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
});

// Export a single-file upload middleware expecting form field name "resume"
const uploadResume = upload.single('resume');

module.exports = { uploadResume };