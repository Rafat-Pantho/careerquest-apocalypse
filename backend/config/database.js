/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Database Connection - The Ancient Scrolls Vault
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB - Opening the Ancient Vault
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
    try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ no longer needs these options, but keeping for clarity
    });

    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║  📜 ANCIENT DATABASE SCROLLS CONNECTED SUCCESSFULLY! 📜      ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Host: ${conn.connection.host.padEnd(52)}                     ║
    ║  Database: ${conn.connection.name.padEnd(48)}                 ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('⚔️ Database connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Lost connection to the Ancient Vault!');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Reconnected to the Ancient Vault!');
    });

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
    await mongoose.connection.close();
    console.log('📜 Ancient Vault sealed safely.');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDatabase, disconnectDatabase };
