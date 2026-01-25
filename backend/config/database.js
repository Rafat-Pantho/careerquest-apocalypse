/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Database Connection - The SQL Chronicles
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'careerquest_apocalypse',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
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
 * Connect to MySQL - Opening the SQL Chronicles
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    const host = sequelize.options.host || 'localhost';
    const dbName = sequelize.config.database || process.env.DB_NAME;
    const dialect = sequelize.getDialect();

    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║  📜 SQL CHRONICLES OPENED SUCCESSFULLY! 📜                   ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Host: ${host.padEnd(52)}                     ║
    ║  Database: ${dbName.padEnd(48)}                 ║
    ║  Dialect: ${dialect.padEnd(49)}                 ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);

    // Sync models (Be careful with { force: true } in production!)
    await sequelize.sync({ alter: true });
    console.log('✨ Tables synchronized with the ancient texts.');

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

/**
 * Gracefully close database connection
 */
const disconnectDatabase = async () => {
  try {
    await sequelize.close();
    console.log('📜 SQL Chronicles closed safely.');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase, disconnectDatabase };
