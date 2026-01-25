const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Guild = sequelize.define('Guild', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  leaderId: { // Foreign Key placeholder
    type: DataTypes.INTEGER,
    allowNull: false
  },
  members: { // Many-to-Many typically, but using JSON to store IDs for quick migration
    type: DataTypes.JSON,
    defaultValue: []
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experiencePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Guild;
