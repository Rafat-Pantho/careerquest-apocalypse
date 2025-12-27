/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Barter Model - The Skill Exchange Tavern
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Represents peer-to-peer skill trading.
 * "I will teach you the dark arts of Video Editing if you teach me Calculus."
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const BARTER_STATUS = {
  OPEN: 'Open',
  NEGOTIATING: 'Negotiating',
  CLOSED: 'Closed'
};

const barterSchema = new mongoose.Schema({
  offering: { // What I can teach
    skill: {
      type: String,
      required: true
    },
    description: String
  },
  seeking: { // What I want to learn
    skill: {
      type: String,
      required: true
    },
    description: String
  },
  merchant: { // The user posting the barter
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offers: [{ // Other users proposing a trade
    trader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: Object.values(BARTER_STATUS),
    default: BARTER_STATUS.OPEN
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Barter', barterSchema);
