const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BossBattle = sequelize.define('BossBattle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('Tutorial', 'Easy', 'Medium', 'Hard', 'Nightmare', 'Raid Boss'),
    defaultValue: 'Easy'
  },
  levelRequirement: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  xpReward: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bossImage: {
    type: DataTypes.STRING,
    defaultValue: '/assets/bosses/default-boss.png'
  },
  problemStatement: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  starterCode: {
    type: DataTypes.TEXT,
    defaultValue: '// Write your spell here...'
  },
  validationCriteria: {
    type: DataTypes.JSON // Storing validation rules as JSON
  }
}, {
  timestamps: true
});

module.exports = BossBattle;
