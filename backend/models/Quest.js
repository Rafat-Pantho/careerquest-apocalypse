/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Quest Model - The Job Board of Destiny
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Represents job listings and internships.
 * - Internships = "Tutorial Levels"
 * - Full-time Jobs = "Raid Bosses"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const QUEST_TYPES = {
  TUTORIAL: 'Tutorial Level', // Internship
  RAID_BOSS: 'Raid Boss',     // Full-time Job
  SIDE_QUEST: 'Side Quest',   // Part-time / Contract
  DAILY_GRIND: 'Daily Grind'  // Freelance
};

const QUEST_DIFFICULTY = {
  NOVICE: 'Novice',       // Entry Level
  ADEPT: 'Adept',         // Mid Level
  VETERAN: 'Veteran',     // Senior Level
  LEGENDARY: 'Legendary'  // Lead / Principal
};

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A quest must have a name!'],
    trim: true
  },
  guild: { // Company Name
    type: String,
    required: [true, 'Which guild is offering this quest?'],
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(QUEST_TYPES),
    default: QUEST_TYPES.TUTORIAL
  },
  difficulty: {
    type: String,
    enum: Object.values(QUEST_DIFFICULTY),
    default: QUEST_DIFFICULTY.NOVICE
  },
  description: { // The Lore
    type: String,
    required: [true, 'Describe the challenge ahead!']
  },
  requirements: [{ // Prerequisites
    type: String
  }],
  rewards: {
    gold: { // Salary/Stipend
      type: String, // String to allow ranges like "10k-15k"
      required: true
    },
    xp: { // Experience Points (Arbitrary value based on difficulty)
      type: Number,
      default: 100
    },
    perks: [{ // Benefits
      type: String
    }]
  },
  location: {
    type: String,
    default: 'Remote Realm'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    hero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deadline: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quest', questSchema);
