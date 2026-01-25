const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mentorship = sequelize.define('Mentorship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  summonerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  incantation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  goals: {
    type: DataTypes.JSON, // Array of strings
    defaultValue: []
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  responseMessage: {
    type: DataTypes.TEXT
  },
  respondedAt: DataTypes.DATE,
  completedAt: DataTypes.DATE,
  feedback: DataTypes.TEXT,
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  sessions: {
    type: DataTypes.JSON, // Array of session objects
    defaultValue: []
  }
});

module.exports = Mentorship;
