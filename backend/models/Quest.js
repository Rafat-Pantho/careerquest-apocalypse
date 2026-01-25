const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

const Quest = sequelize.define('Quest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A quest must have a name!'
      }
    }
  },
  guild: { // Company Name
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Which guild is offering this quest?'
      }
    }
  },
  type: {
    type: DataTypes.ENUM(Object.values(QUEST_TYPES)),
    defaultValue: QUEST_TYPES.TUTORIAL
  },
  difficulty: {
    type: DataTypes.ENUM(Object.values(QUEST_DIFFICULTY)),
    defaultValue: QUEST_DIFFICULTY.NOVICE
  },
  description: { // The Lore
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Describe the challenge ahead!'
      }
    }
  },
  requirements: { // Store as JSON for simplicity in migration
    type: DataTypes.JSON,
    defaultValue: []
  },
  rewards_gold: { // Flattened structure
    type: DataTypes.STRING,
    allowNull: false
  },
  rewards_xp: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  rewards_perks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: 'Remote Realm'
  },
  postedBy: { // Foreign Key placeholder
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Quest;
