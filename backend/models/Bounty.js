/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Bounty Model - The Mercenary's Guild (Tuition Marketplace)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Represents tuition jobs posted by parents/guardians.
 * "Wanted: A brave soul to slay the beasts of Quadratic Equations..."
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const BOUNTY_STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const bountySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'What is the bounty?'],
    trim: true
  },
  description: { // "Slay the beast of Grade 9 Math"
    type: String,
    required: true
  },
  subject: { // The Beast
    type: String,
    required: true
  },
  gradeLevel: { // Difficulty
    type: String,
    required: true
  },
  reward: { // Monthly Salary in Gold (BDT)
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'Gold Coins (BDT)'
    },
    frequency: {
      type: String,
      default: 'Monthly'
    }
  },
  location: {
    type: String, // Area/Location
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    mercenary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String, // "I have slain many such beasts before..."
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: Object.values(BOUNTY_STATUS),
    default: BOUNTY_STATUS.OPEN
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bounty', bountySchema);
