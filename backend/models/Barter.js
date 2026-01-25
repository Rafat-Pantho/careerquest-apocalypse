const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BARTER_STATUS = {
  OPEN: 'Open',
  NEGOTIATING: 'Negotiating',
  CLOSED: 'Closed'
};

const Barter = sequelize.define('Barter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  offering: {
    type: DataTypes.JSON, // { skill, description }
    allowNull: false
  },
  seeking: {
    type: DataTypes.JSON, // { skill, description }
    allowNull: false
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  offers: {
    type: DataTypes.JSON, // Array of { trader, message, status, createdAt }
    defaultValue: []
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: BARTER_STATUS.OPEN
  }
});

module.exports = Barter;
