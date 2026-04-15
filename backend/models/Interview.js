const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Interview Schema — Tracks a full AI-driven interview session
// -----------------------------------------------------------------------------
const InterviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [false, 'User reference is required'], //temporary false
        },
        jobRole: {
            type: String,
            required: [true, 'Job role is required'],
            trim: true,
        },
        questions: {
            type: [String],
            default: [],
        },
        currentQuestionIndex: {
            type: Number,
            default: 0,
        },
        answers: [
            {
                question: { type: String },
                userAnswer: { type: String },
            },
        ],
        analysis: {
            overallScore: { type: Number, default: null },
            overallFeedback: { type: String, default: '' },
            questionBreakdown: [
                {
                    question: { type: String },
                    critique: { type: String },
                    betterAnswer: { type: String },
                },
            ],
        },
        status: {
            type: String,
            enum: {
                values: ['in-progress', 'completed'],
                message: '{VALUE} is not a valid interview status',
            },
            default: 'in-progress',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Interview', InterviewSchema);