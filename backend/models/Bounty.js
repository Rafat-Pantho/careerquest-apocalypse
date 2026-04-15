const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Bounty Schema
// -----------------------------------------------------------------------------
const BountySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Bounty title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        reward: {
            type: Number,
            required: [true, 'Reward amount is required'],
            min: [0, 'Reward cannot be negative'],
        },
        difficulty: {
            type: String,
            enum: {
                values: ['Beginner', 'Intermediate', 'Expert'],
                message: '{VALUE} is not a valid difficulty level',
            },
            required: [true, 'Difficulty level is required'],
        },
        status: {
            type: String,
            enum: ['Open', 'Closed'],
            default: 'Open',
        },
        // Quick-access list of users who applied (refs kept in sync with Application docs)
        applicants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Distinguish between job posts and tuition posts
        type: {
            type: String,
            enum: {
                values: ['job', 'tuition'],
                message: '{VALUE} is not a valid post type',
            },
            required: [true, 'Post type is required'],
        },
        characterClass: {
            type: String,
            enum: ['Mage', 'Fighter', 'Hunter', 'Tank', 'Healer', 'Assassin', 'Any'],
            default: 'Any',
        },
        // Admin verification flag
        isVerified: {
            type: Boolean,
            default: false,
        },
        // The recruiter / poster of the bounty
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// --------------- Export Bounty model ----------------------------------------
const Bounty = mongoose.model('Bounty', BountySchema);

module.exports = { Bounty };