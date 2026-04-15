const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Milestone Schema
// -----------------------------------------------------------------------------
const MilestoneSchema = new mongoose.Schema(
    {
        stepNumber: {
            type: Number,
            required: [true, 'Step number is required'],
            unique: true, // No two milestones share the same step
        },
        title: {
            type: String,
            required: [true, 'Milestone title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        xpReward: {
            type: Number,
            default: 0,
            min: [0, 'XP reward cannot be negative'],
        },
    },
    { timestamps: true }
);

// -----------------------------------------------------------------------------
// UserProgress Schema
// -----------------------------------------------------------------------------
const UserProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // each user has exactly one progress document
        },
        currentStep: {
            type: Number,
            default: 1, // everyone starts at step 1
            min: 1,
        },
        completedMilestones: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Milestone',
            },
        ],
    },
    { timestamps: true }
);

// --------------- Export both models from the same file -----------------------
const Milestone = mongoose.model('Milestone', MilestoneSchema);
const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

module.exports = { Milestone, UserProgress };