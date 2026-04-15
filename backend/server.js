require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('./config/passport');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Initialise Passport (Google OAuth strategy loaded from config/passport.js)
app.use(passport.initialize());

// Serve uploaded files statically (e.g., /uploads/resumes/resume-xxx.pdf)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'CareerQuest Backend Running' });
});

// API Routes (Placeholders)
app.use('/api/career', require('./routes/career'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/gemini', require('./routes/gemini'));

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Feature Routes
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/bounties', require('./routes/bounty'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/profile', require('./routes/profile')); // Ported from MySQL

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Application Routes
app.use('/api/applications', require('./routes/application'));

// Interview Routes
app.use('/api/interview', require('./routes/interview'));

// New Fun Features
app.use('/api/doom-scope', require('./routes/doomscope'));
app.use('/api/roast', require('./routes/roast'));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});