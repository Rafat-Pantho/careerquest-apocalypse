const mongoose = require('mongoose');

const bossBattleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'The Boss must have a name!'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Describe the terror of this beast!']
  },
  difficulty: {
    type: String,
    enum: ['Tutorial', 'Easy', 'Medium', 'Hard', 'Nightmare', 'Raid Boss'],
    default: 'Easy'
  },
  levelRequirement: {
    type: Number,
    default: 1
  },
  xpReward: {
    type: Number,
    required: true
  },
  bossImage: {
    type: String,
    default: '/assets/bosses/default-boss.png'
  },
  // The coding challenge
  problemStatement: {
    type: String,
    required: true
  },
  starterCode: {
    type: String,
    default: '// Write your spell here...'
  },
  // Simple validation for the MVP: Check if the code contains specific keywords or matches a regex
  // In a real app, we'd use a sandboxed code runner
  validationCriteria: {
    requiredKeywords: [String],
    forbiddenKeywords: [String],
    expectedOutput: String // For simple return value checks
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BossBattle', bossBattleSchema);
