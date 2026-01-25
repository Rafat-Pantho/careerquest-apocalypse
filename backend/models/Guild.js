const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Guild = sequelize.define('Guild', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  leaderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  members: {
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
  // Members will be handled via Association or JSON if lazy. 
  // For now, let's rely on User.guildId association.
});

module.exports = Guild;
