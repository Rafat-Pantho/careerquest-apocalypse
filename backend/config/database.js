/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Database Connection - The MySQL Armory
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with MySQL connection details
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'careerquest_apocalypse',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

/**
 * Connect to MySQL - Opening the Armory Gates
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
    try {
    await sequelize.authenticate();

    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║  ⚔️ MYSQL ARMORY CONNECTED SUCCESSFULLY! ⚔️                   ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Host: ${String(process.env.MYSQL_HOST || 'localhost').padEnd(52)}                 ║
    ║  Database: ${String(process.env.MYSQL_DATABASE || 'careerquest_apocalypse').padEnd(48)}             ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);
    
    // Sync models
    // await sequelize.sync({ alter: true }); // This helps update tables if models change
    // console.log('   🛡️  Tables Synchronized');

  } catch (error) {
    console.error(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║  💀 CRITICAL HIT! DATABASE CONNECTION FAILED! 💀             ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Error: ${error.message.substring(0, 52).padEnd(52)}          ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase };
