/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Quest Model - The Job Board of Destiny
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QUEST_TYPES = {
  TUTORIAL: 'Tutorial Level',
  RAID_BOSS: 'Raid Boss',
  SIDE_QUEST: 'Side Quest',
  DAILY_GRIND: 'Daily Grind'
};

const QUEST_DIFFICULTY = {
  NOVICE: 'Novice',
  ADEPT: 'Adept',
  VETERAN: 'Veteran',
  LEGENDARY: 'Legendary'
};

const Quest = sequelize.define('Quest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guild: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: QUEST_TYPES.TUTORIAL
  },
  difficulty: {
    type: DataTypes.STRING,
    defaultValue: QUEST_DIFFICULTY.NOVICE
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.JSON, // Array of strings
    defaultValue: []
  },
  rewards: {
    type: DataTypes.JSON, // { gold, xp, perks }
    defaultValue: {
      gold: '0',
      xp: 100,
      perks: []
    }
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: 'Remote Realm'
  },
  // Foreign Key for poster
  postedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Applicants as JSON array for now to preserve structure
  applicants: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  deadline: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Quest;
