/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * User (Hero) Model - The Sacred Character Sheet
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Enum Constants (kept for reference, can be used in validation)
const HERO_CLASSES = {
  CODE_WIZARD: 'Code Wizard',
  DATA_SORCERER: 'Data Sorcerer',
  DESIGN_ENCHANTER: 'Design Enchanter',
  MERCHANT_LORD: 'Merchant Lord',
  WORD_WEAVER: 'Word Weaver',
  CIRCUIT_SHAMAN: 'Circuit Shaman',
  BIO_ALCHEMIST: 'Bio Alchemist',
  LAW_PALADIN: 'Law Paladin',
  MIND_HEALER: 'Mind Healer',
  NUMBER_NECROMANCER: 'Number Necromancer',
  UNCLASSED: 'Unclassed'
};

const HERO_TITLES = {
  LEVEL_1: 'Fresh Spawn',
  LEVEL_6: 'Apprentice Adventurer',
  LEVEL_11: 'Journeyman Seeker',
  LEVEL_21: 'Veteran Warrior',
  LEVEL_36: 'Elite Champion',
  LEVEL_51: 'Legendary Hero',
  LEVEL_76: 'Mythical Overlord',
  LEVEL_100: 'Ascended One'
};

const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banished',
  SUSPENDED: 'cursed'
};

const USER_ROLES = {
  HERO: 'hero',
  ELDER: 'elder',
  GUILD_MASTER: 'guild_master',
  DUNGEON_MASTER: 'dungeon_master'
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Real World Data
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email address' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Can be null for OAuth
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^[+]?[\d\s-]{10,}$/
    }
  },
  location_city: {
    type: DataTypes.STRING
  },
  location_country: {
    type: DataTypes.STRING
  },
  // We can store coordinates as JSON or simple fields for now
  location_coordinates: {
    type: DataTypes.JSON // [longitude, latitude]
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'mage'
  },
  resumeScrollPath: {
    type: DataTypes.STRING
  },
  social_linkedin: DataTypes.STRING,
  social_github: DataTypes.STRING,
  social_portfolio: DataTypes.STRING,
  social_twitter: DataTypes.STRING,
  heroicSummary: DataTypes.TEXT,

  // Fantasy Data
  heroName: {
    type: DataTypes.STRING(30),
    defaultValue: function () {
      // Note: this.firstName might not be available here in the same way depending on when it's called
      // Best to handle this in a hook or manually
      return 'Unclassed Hero';
    }
  },
  heroClass: {
    type: DataTypes.ENUM(Object.values(HERO_CLASSES)),
    defaultValue: HERO_CLASSES.UNCLASSED
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: { min: 1, max: 100 }
  },
  experiencePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  goldCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: { min: 0 }
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: HERO_TITLES.LEVEL_1
  },

  // Stats - Stored as separate columns or JSON. Separate columns allows easier querying/indexing.
  stat_charisma: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 100 } },
  stat_intelligence: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 100 } },
  stat_wisdom: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 100 } },
  stat_endurance: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 100 } },
  stat_luck: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 100 } },

  // JSON columns for complex nested data (for rapid migration)
  achievements: { type: DataTypes.JSON, defaultValue: [] },
  streaks: { type: DataTypes.JSON, defaultValue: { dailyLogin: 0, applicationsThisWeek: 0, interviewsCompleted: 0 } },

  // These should ideally be separate tables, but using JSON for speed as requested
  bossBattlesWon: { type: DataTypes.JSON, defaultValue: [] },
  specialAttacks: { type: DataTypes.JSON, defaultValue: [] },
  battleHistory: { type: DataTypes.JSON, defaultValue: [] },
  trainingGrounds: { type: DataTypes.JSON, defaultValue: [] },

  nextLevelXP: { // Virtual or stored
    type: DataTypes.INTEGER
  },
  guildId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // System Fields
  role: {
    type: DataTypes.ENUM(Object.values(USER_ROLES)),
    defaultValue: USER_ROLES.HERO
  },
  accountStatus: {
    type: DataTypes.ENUM(Object.values(ACCOUNT_STATUS)),
    defaultValue: ACCOUNT_STATUS.ACTIVE
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: DataTypes.STRING,
  emailVerificationExpire: DataTypes.DATE,
  passwordResetToken: DataTypes.STRING,
  passwordResetExpire: DataTypes.DATE,
  lastLogin: DataTypes.DATE,
  refreshTokens: {
    type: DataTypes.JSON, // Array of tokens
    defaultValue: []
  },
  notificationPreferences: {
    type: DataTypes.JSON,
    defaultValue: {
      questAlerts: true,
      mentorMessages: true,
      weeklyDigest: true,
      promotionalOffers: false
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      // Hash password
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }

      // Update title based on level
      if (user.changed('level')) {
        const level = user.level;
        if (level >= 100) user.title = HERO_TITLES.LEVEL_100;
        else if (level >= 76) user.title = HERO_TITLES.LEVEL_76;
        else if (level >= 51) user.title = HERO_TITLES.LEVEL_51;
        else if (level >= 36) user.title = HERO_TITLES.LEVEL_36;
        else if (level >= 21) user.title = HERO_TITLES.LEVEL_21;
        else if (level >= 11) user.title = HERO_TITLES.LEVEL_11;
        else if (level >= 6) user.title = HERO_TITLES.LEVEL_6;
        else user.title = HERO_TITLES.LEVEL_1;
      }

      // Check for level up from XP (Simplified)
      if (user.changed('experiencePoints')) {
        const xpNeeded = Math.floor(100 * Math.pow(user.level, 1.5));
        while (user.experiencePoints >= xpNeeded && user.level < 100) {
          user.level += 1;
        }
      }

      // Default Hero Name if not set
      if (!user.heroName && user.firstName) {
        user.heroName = `${user.firstName} the Unclassed`;
      }
    }
  }
});

// Instance Methods
User.prototype.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      role: this.role,
      heroClass: this.heroClass
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ... add other methods as needed, converting to simple functions operating on 'this'

module.exports = User;
