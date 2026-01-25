const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message cannot be empty'
      }
    }
  },
  room: {
    type: DataTypes.STRING,
    defaultValue: 'tavern'
  },
  senderId: { // Foreign Key placeholder
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  updatedAt: false // Messages usually don't need 'updatedAt'
});

module.exports = Message;
