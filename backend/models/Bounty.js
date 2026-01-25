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
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  reward: {
    type: DataTypes.JSON, // { amount, currency, frequency }
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  applicants: {
    type: DataTypes.JSON, // Array of { mercenary, message, appliedAt }
    defaultValue: []
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: BOUNTY_STATUS.OPEN
  }
});

module.exports = Bounty;
