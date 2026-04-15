const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // --- Identity fields ---
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },

    // --- Local auth ---
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters'],
    },

    // --- Google OAuth ---
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatarUrl: {
        type: String,
        default: null,
    },

    // --- Role & Gamification ---
    role: {
        type: String,
        enum: ['student', 'job_recruiter', 'tuition_recruiter', 'admin'],
        default: 'student',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    characterClass: {
        type: String,
        enum: ['Mage', 'Fighter', 'Hunter', 'Tank', 'Healer', 'Assassin', 'None'],
        default: 'None',
    },

    // --- Recruiter Profile (for job_recruiter / tuition_recruiter) ---
    recruiterProfile: {
        // job_recruiter fields
        companyName: { type: String, default: '', trim: true },
        position: { type: String, default: '', trim: true },
        companyWebsite: { type: String, default: '', trim: true },
        industry: { type: String, default: '', trim: true },
        // tuition_recruiter fields
        parentName: { type: String, default: '', trim: true },
        address: { type: String, default: '', trim: true },
        relation: { type: String, default: '', trim: true },
    },

    title: { // role_title
        type: String,
        default: '',
        trim: true
    },
    skills: {
        type: [String],
        default: []
    },
    xp: { type: Number, default: 0 },

    // --- Profile Details ---
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    summary: { type: String, default: '' },
    experience: [{
        company: String,
        role: String,
        duration: String,
        details: String
    }],
    education: [{
        institution: String,
        degree: String,
        year: String
    }],

    // --- Resume Dramatizer fields ---
    originalResumePath: {
        type: String,
        default: null,
    },
    dramaticResume: {
        type: String,
        default: null,
    },

    createdAt: { type: Date, default: Date.now },
});

// Pre-save Hook — Hash password before persisting
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Instance Method — Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);