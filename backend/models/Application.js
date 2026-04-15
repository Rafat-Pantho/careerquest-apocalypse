const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Application Schema — Tracks who applied to which Bounty
// -----------------------------------------------------------------------------
const ApplicationSchema = new mongoose.Schema(
    {
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Applicant is required'],
        },
        bounty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bounty',
            required: [true, 'Bounty reference is required'],
        },
        resume: {
            type: String,
            default: '',
            trim: true,
        },
        coverMessage: {
            type: String,
            default: '',
            trim: true,
            maxlength: [1000, 'Cover message cannot exceed 1000 characters'],
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'shortlisted', 'rejected', 'accepted'],
                message: '{VALUE} is not a valid application status',
            },
            default: 'pending',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Prevent the same user from applying to the same bounty twice at DB level
ApplicationSchema.index({ applicant: 1, bounty: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);