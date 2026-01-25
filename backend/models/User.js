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

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // REAL WORLD DATA
  // ─────────────────────────────────────────────────────────────────────────────
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Null allowed for OAuth users
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  phone: {
    type: DataTypes.STRING
  },
  // Location stored as JSON
  location: {
    type: DataTypes.JSON, // { city, country, coordinates: [long, lat] }
    defaultValue: {}
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'mage'
  },
  resumeScrollPath: {
    type: DataTypes.STRING
  },
  socialPortals: {
    type: DataTypes.JSON, // { linkedin, github, portfolio, twitter }
    defaultValue: {}
  },
  heroicSummary: {
    type: DataTypes.TEXT
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FANTASY DATA
  // ─────────────────────────────────────────────────────────────────────────────
  heroName: {
    type: DataTypes.STRING,
    defaultValue: 'The Unclassed'
  },
  heroClass: {
    type: DataTypes.STRING,
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
  // Arrays stored as JSON
  bossBattlesWon: {
    type: DataTypes.JSON, // Array of IDs
    defaultValue: []
  },
  goldCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: HERO_TITLES.LEVEL_1
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      charisma: 10,
      intelligence: 10,
      wisdom: 10,
      endurance: 10,
      luck: 10
    }
  },
  achievements: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  streaks: {
    type: DataTypes.JSON,
    defaultValue: {
      dailyLogin: 0,
      applicationsThisWeek: 0,
      interviewsCompleted: 0,
      lastActiveDate: null
    }
  },
  interviewHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  epicQuests: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  enchantments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {}
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CHARACTER SHEET & TRACKING (JSON Arrays)
  // ─────────────────────────────────────────────────────────────────────────────
  specialAttacks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  battleHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  trainingGrounds: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  questLog: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  savedQuests: {
    type: DataTypes.JSON,
    defaultValue: []
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MENTORSHIP & SOCIAL
  // ─────────────────────────────────────────────────────────────────────────────
  summonedElders: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  friends: {
    type: DataTypes.JSON, // JSON array of friend IDs for now
    defaultValue: []
  },
  friendRequests: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  guildId: {
    type: DataTypes.UUID, // Foreign key manually handled for now
    allowNull: true
  },
  apprentices: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  barterOffers: {
    type: DataTypes.JSON,
    defaultValue: []
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SYSTEM FIELDS
  // ─────────────────────────────────────────────────────────────────────────────
  role: {
    type: DataTypes.STRING,
    defaultValue: USER_ROLES.HERO
  },
  accountStatus: {
    type: DataTypes.STRING,
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
    type: DataTypes.JSON,
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
  hooks: {
    beforeSave: async (user) => {
      // Hash password if changed
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }

      // Update title based on level
      if (user.changed('level')) {
        if (user.level >= 100) user.title = HERO_TITLES.LEVEL_100;
        else if (user.level >= 76) user.title = HERO_TITLES.LEVEL_76;
        else if (user.level >= 51) user.title = HERO_TITLES.LEVEL_51;
        else if (user.level >= 36) user.title = HERO_TITLES.LEVEL_36;
        else if (user.level >= 21) user.title = HERO_TITLES.LEVEL_21;
        else if (user.level >= 11) user.title = HERO_TITLES.LEVEL_11;
        else if (user.level >= 6) user.title = HERO_TITLES.LEVEL_6;
        else user.title = HERO_TITLES.LEVEL_1;
      }

      // Check for level up from XP
      if (user.changed('experiencePoints')) {
        const xpNeeded = Math.floor(100 * Math.pow(user.level, 1.5));
        while (user.experiencePoints >= xpNeeded && user.level < 100) {
          user.level += 1;
        }
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════════════════════════

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

User.prototype.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this.id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  const tokens = this.refreshTokens || [];
  tokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  // Create a new array instance to trigger update for JSON column
  this.refreshTokens = [...tokens];
  this.save();

  return refreshToken;
};

// ... (Other methods like awardXp would similarly act on the fields)

module.exports = User;
