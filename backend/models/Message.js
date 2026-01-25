const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  room: {
    type: DataTypes.STRING,
    defaultValue: 'tavern'
  }
}, {
  timestamps: true,
  updatedAt: false // Only createdAt is needed
});

module.exports = Message;
