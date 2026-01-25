const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BOUNTY_STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const Bounty = sequelize.define('Bounty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gradeLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reward_amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reward_currency: {
    type: DataTypes.STRING,
    defaultValue: 'Gold Coins (BDT)'
  },
  reward_frequency: {
    type: DataTypes.STRING,
    defaultValue: 'Monthly'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  applicants: {
    type: DataTypes.JSON, // Storing applicants as JSON
    defaultValue: []
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(Object.values(BOUNTY_STATUS)),
    defaultValue: BOUNTY_STATUS.OPEN
  }
}, {
  timestamps: true
});

module.exports = Bounty;
