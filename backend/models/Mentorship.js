const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mentorship = sequelize.define('Mentorship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  summonerId: { // Foreign Key placeholder
    type: DataTypes.INTEGER,
    allowNull: false
  },
  elderId: { // Foreign Key placeholder
    type: DataTypes.INTEGER,
    allowNull: false
  },
  incantation: { // The message/request
    type: DataTypes.TEXT,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  goals: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Active', 'Rejected', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  responseMessage: DataTypes.TEXT,
  respondedAt: DataTypes.DATE,
  completedAt: DataTypes.DATE,
  feedback: DataTypes.TEXT,
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  sessions: { // Log of meetings stored as JSON
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = Mentorship;
