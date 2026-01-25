/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Application Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/careerquest_apocalypse',

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  },

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY,

  // CORS
  // clientUrl is already defined above

  // File uploads
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  uploadPath: process.env.UPLOAD_PATH || './uploads',

  // XP Rewards configuration
  xpRewards: {
    dailyLogin: 10,
    applicationSubmitted: 25,
    interviewCompleted: 50,
    cvGenerated: 15,
    skillAdded: 20,
    mentorConnected: 30,
    barterCompleted: 40,
    profileCompleted: 100
  },

  // Gold rewards
  goldRewards: {
    dailyLogin: 5,
    referralBonus: 50,
    achievementBonus: 25
  }
};

module.exports = config;
