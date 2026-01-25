const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BARTER_STATUS = {
  OPEN: 'Open',
  NEGOTIATING: 'Negotiating',
  CLOSED: 'Closed'
};

const Barter = sequelize.define('Barter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  offering_skill: {
    type: DataTypes.STRING,
    allowNull: false
  },
  offering_description: DataTypes.TEXT,
  seeking_skill: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seeking_description: DataTypes.TEXT,
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  offers: {
    type: DataTypes.JSON, // Storing offers as JSON
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM(Object.values(BARTER_STATUS)),
    defaultValue: BARTER_STATUS.OPEN
  }
}, {
  timestamps: true
});

module.exports = Barter;
