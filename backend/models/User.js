/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * User (Hero) Model - The Sacred Character Sheet
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This schema represents a Hero in the realm of CareerQuest.
 * It stores both "Real World Data" (for actual functionality) and 
 * "Fantasy Data" (for the RPG experience).
 * 
 * Remember: Behind every Code Wizard is a developer who just wants a job.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════════════════════════
// ENUM DEFINITIONS - The Sacred Classifications
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hero Classes - The fundamental archetypes of the job-seeking realm
 * Each class corresponds to a real-world career path
 */
const HERO_CLASSES = {
  CODE_WIZARD: 'Code Wizard',           // Computer Science / Software Engineering
  DATA_SORCERER: 'Data Sorcerer',       // Data Science / Analytics
  DESIGN_ENCHANTER: 'Design Enchanter', // UI/UX / Graphic Design
  MERCHANT_LORD: 'Merchant Lord',       // Business / Finance / Marketing
  WORD_WEAVER: 'Word Weaver',           // Content Writing / Communications
  CIRCUIT_SHAMAN: 'Circuit Shaman',     // Electrical / Hardware Engineering
  BIO_ALCHEMIST: 'Bio Alchemist',       // Biology / Medical / Pharmacy
  LAW_PALADIN: 'Law Paladin',           // Law / Legal Studies
  MIND_HEALER: 'Mind Healer',           // Psychology / Counseling
  NUMBER_NECROMANCER: 'Number Necromancer', // Mathematics / Statistics
  UNCLASSED: 'Unclassed'                // Not yet chosen
};

/**
 * Hero Titles - Earned through glory and XP
 * Titles evolve as the hero gains experience
 */
const HERO_TITLES = {
  LEVEL_1: 'Fresh Spawn',               // Level 1-5
  LEVEL_6: 'Apprentice Adventurer',     // Level 6-10
  LEVEL_11: 'Journeyman Seeker',        // Level 11-20
  LEVEL_21: 'Veteran Warrior',          // Level 21-35
  LEVEL_36: 'Elite Champion',           // Level 36-50
  LEVEL_51: 'Legendary Hero',           // Level 51-75
  LEVEL_76: 'Mythical Overlord',        // Level 76-99
  LEVEL_100: 'Ascended One'             // Level 100 (Employed with benefits)
};

/**
 * Account Status - The hero's standing in the realm
 */
const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banished',       // Fantasy term for banned
  SUSPENDED: 'cursed'       // Fantasy term for suspended
};

/**
 * User Roles - The hierarchy of power
 */
const USER_ROLES = {
  HERO: 'hero',                    // Regular user
  ELDER: 'elder',                  // Alumni/Mentor
  GUILD_MASTER: 'guild_master',    // Recruiter
  DUNGEON_MASTER: 'dungeon_master' // Admin
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-SCHEMAS - The Components of a Hero
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Special Attack Schema - Skills represented as combat abilities
 */
const specialAttackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Every attack needs a name, warrior!'],
    trim: true,
    maxlength: [50, 'Attack name cannot exceed 50 characters']
  },
  // The actual skill name (e.g., "Python", "React", "Photoshop")
  realSkillName: {
    type: String,
    required: true,
    trim: true
  },
  // Power level 1-100 (proficiency percentage)
  powerLevel: {
    type: Number,
    min: [1, 'Even a noob has at least level 1'],
    max: [100, 'You cannot exceed mortal limits... yet'],
    default: 1
  },
  // Skill category for filtering
  attackType: {
    type: String,
    enum: ['technical', 'soft', 'language', 'tool', 'certification'],
    default: 'technical'
  },
  // Years of experience with this skill
  yearsWielded: {
    type: Number,
    min: 0,
    default: 0
  },
  // Is this skill verified/certified?
  isEnchanted: {
    type: Boolean,
    default: false
  }
}, { _id: true });

/**
 * Battle History Schema - Work/Project Experience
 */
const battleHistorySchema = new mongoose.Schema({
  // Campaign name (Company/Organization name)
  campaignName: {
    type: String,
    required: [true, 'Where did you fight, soldier?'],
    trim: true
  },
  // Role/Position held
  rank: {
    type: String,
    required: [true, 'What was your rank in battle?'],
    trim: true
  },
  // Department/Team
  battalion: {
    type: String,
    trim: true
  },
  // Location
  battleground: {
    type: String,
    trim: true
  },
  // Start date
  campaignStart: {
    type: Date,
    required: [true, 'When did you join the fight?']
  },
  // End date (null if current)
  campaignEnd: {
    type: Date,
    default: null
  },
  // Is this a current position?
  stillFighting: {
    type: Boolean,
    default: false
  },
  // Description of responsibilities/achievements
  warStories: [{
    type: String,
    trim: true
  }],
  // Technologies/Skills used
  weaponsUsed: [{
    type: String,
    trim: true
  }]
}, { _id: true });

/**
 * Training Grounds Schema - Education History
 */
const trainingGroundsSchema = new mongoose.Schema({
  // Institution name
  academyName: {
    type: String,
    required: [true, 'Where were you trained?'],
    trim: true
  },
  // Degree/Certification
  scrollObtained: {
    type: String,
    required: [true, 'What scroll did you earn?'],
    trim: true
  },
  // Field of study
  disciplineMastered: {
    type: String,
    required: true,
    trim: true
  },
  // Start date
  trainingStart: {
    type: Date,
    required: true
  },
  // End date
  trainingEnd: {
    type: Date
  },
  // Still studying?
  stillTraining: {
    type: Boolean,
    default: false
  },
  // GPA/Grade (stored as string to accommodate different systems)
  honorScore: {
    type: String,
    trim: true
  },
  // Notable achievements
  achievements: [{
    type: String,
    trim: true
  }]
}, { _id: true });

/**
 * Quest Log Schema - Job Applications tracking
 */
const questLogSchema = new mongoose.Schema({
  // Reference to the Quest (Job) applied for
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  },
  questTitle: {
    type: String,
    required: true
  },
  guildName: {
    type: String,  // Company name
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  // Application status
  status: {
    type: String,
    enum: [
      'scroll_sent',        // Applied
      'scroll_viewed',      // Application viewed
      'summoned',           // Interview scheduled
      'trial_combat',       // Interview in progress
      'victorious',         // Accepted
      'defeated',           // Rejected
      'retreated'           // Withdrew application
    ],
    default: 'scroll_sent'
  },
  // Survival probability calculated at application time
  survivalProbability: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true, timestamps: true });

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN USER (HERO) SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const userSchema = new mongoose.Schema({
  // ─────────────────────────────────────────────────────────────────────────────
  // REAL WORLD DATA - The Boring (But Essential) Stuff
  // ─────────────────────────────────────────────────────────────────────────────
  
  email: {
    type: String,
    required: [true, 'Email is required to receive quest notifications!'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },

  password: {
    type: String,
    required: function() {
      // Password not required for OAuth users
      return !this.googleId;
    },
    minlength: [8, 'Your secret passphrase must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },

  // Google OAuth ID
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },

  // Real name
  firstName: {
    type: String,
    required: [true, 'A hero must have a first name!'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    default: '',
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  // Contact information
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s-]{10,}$/, 'Please provide a valid phone number']
  },

  // Location
  location: {
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    coordinates: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number] // [longitude, latitude]
    }
  },

  // Profile avatar - predefined avatar ID (warrior, mage, rogue, healer, scholar, ranger)
  avatar: {
    type: String,
    default: 'mage'
  },

  // Resume/CV file path
  resumeScrollPath: {
    type: String
  },

  // Portfolio/LinkedIn/GitHub links
  socialPortals: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },

  // Bio/Summary
  heroicSummary: {
    type: String,
    maxlength: [1000, 'Your heroic tale cannot exceed 1000 characters'],
    trim: true
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FANTASY DATA - The Fun Stuff (RPG Mechanics)
  // ─────────────────────────────────────────────────────────────────────────────

  // Hero's chosen display name
  heroName: {
    type: String,
    trim: true,
    maxlength: [30, 'Hero name cannot exceed 30 characters'],
    default: function() {
      return `${this.firstName} the Unclassed`;
    }
  },

  // Character class
  heroClass: {
    type: String,
    enum: Object.values(HERO_CLASSES),
    default: HERO_CLASSES.UNCLASSED
  },

  // Current level (1-100)
  level: {
    type: Number,
    min: 1,
    max: 100,
    default: 1
  },

  // Experience points
  experiencePoints: {
    type: Number,
    min: 0,
    default: 0
  },

  // Boss Battles Won
  bossBattlesWon: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BossBattle'
  }],

  // Gold coins (can be earned through activities, displayed alongside real currency)
  goldCoins: {
    type: Number,
    min: 0,
    default: 100 // Starting gold
  },

  // Hero title (based on level)
  title: {
    type: String,
    default: HERO_TITLES.LEVEL_1
  },

  // Stats - RPG-style attributes affecting various calculations
  stats: {
    // Charisma - affects networking success, interview scores
    charisma: { type: Number, min: 1, max: 100, default: 10 },
    // Intelligence - affects skill learning speed, technical assessments
    intelligence: { type: Number, min: 1, max: 100, default: 10 },
    // Wisdom - affects career advice quality, mentor matching
    wisdom: { type: Number, min: 1, max: 100, default: 10 },
    // Endurance - affects application stamina, rejection resilience
    endurance: { type: Number, min: 1, max: 100, default: 10 },
    // Luck - affects random bonuses, job matching
    luck: { type: Number, min: 1, max: 100, default: 10 }
  },

  // Achievement badges
  achievements: [{
    name: { type: String, required: true },
    description: { type: String },
    iconUrl: { type: String },
    earnedAt: { type: Date, default: Date.now },
    xpReward: { type: Number, default: 0 }
  }],

  // Streak tracking for gamification
  streaks: {
    dailyLogin: { type: Number, default: 0 },
    applicationsThisWeek: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    lastActiveDate: { type: Date }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CHARACTER SHEET DATA - Skills, Experience, Education
  // ─────────────────────────────────────────────────────────────────────────────

  // Skills as "Special Attacks"
  specialAttacks: [specialAttackSchema],

  // Work experience as "Battle History"
  battleHistory: [battleHistorySchema],

  // Education as "Training Grounds"
  trainingGrounds: [trainingGroundsSchema],

  // ─────────────────────────────────────────────────────────────────────────────
  // APPLICATION TRACKING
  // ─────────────────────────────────────────────────────────────────────────────

  // Quest log - applied jobs
  questLog: [questLogSchema],

  // Saved/Bookmarked quests
  savedQuests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  }],

  // ─────────────────────────────────────────────────────────────────────────────
  // MENTORSHIP & NETWORKING
  // ─────────────────────────────────────────────────────────────────────────────

  // Mentors (Elders) this hero is connected with
  summonedElders: [{
    elderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    summonedAt: { type: Date, default: Date.now },
    relationshipStatus: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending'
    }
  }],

  // Friends (Allies)
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Friend Requests
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Guild Membership
  guild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild'
  },

  // Heroes this Elder is mentoring (if role is Elder)
  apprentices: [{
    heroId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date, default: Date.now }
  }],

  // Skill barter offers
  barterOffers: [{
    skillOffered: { type: String },
    skillWanted: { type: String },
    status: {
      type: String,
      enum: ['open', 'matched', 'completed', 'cancelled'],
      default: 'open'
    },
    matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],

  // ─────────────────────────────────────────────────────────────────────────────
  // SYSTEM FIELDS
  // ─────────────────────────────────────────────────────────────────────────────

  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.HERO
  },

  accountStatus: {
    type: String,
    enum: Object.values(ACCOUNT_STATUS),
    default: ACCOUNT_STATUS.ACTIVE
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationToken: String,
  emailVerificationExpire: Date,

  passwordResetToken: String,
  passwordResetExpire: Date,

  lastLogin: {
    type: Date
  },

  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],

  // Notification preferences
  notificationPreferences: {
    questAlerts: { type: Boolean, default: true },
    mentorMessages: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    promotionalOffers: { type: Boolean, default: false }
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INDEXES - For Query Performance
// ═══════════════════════════════════════════════════════════════════════════════

userSchema.index({ heroClass: 1, level: -1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ 'specialAttacks.realSkillName': 1 });

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUALS - Computed Properties
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Full name virtual
 */
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Calculate XP needed for next level
 * Formula: 100 * (level ^ 1.5)
 */
userSchema.virtual('xpToNextLevel').get(function() {
  return Math.floor(100 * Math.pow(this.level, 1.5));
});

/**
 * Calculate XP progress percentage to next level
 */
userSchema.virtual('xpProgress').get(function() {
  const xpForCurrentLevel = this.level === 1 ? 0 : Math.floor(100 * Math.pow(this.level - 1, 1.5));
  const xpForNextLevel = this.xpToNextLevel;
  const progressXp = this.experiencePoints - xpForCurrentLevel;
  const neededXp = xpForNextLevel - xpForCurrentLevel;
  return Math.min(100, Math.floor((progressXp / neededXp) * 100));
});

/**
 * Total skills count
 */
userSchema.virtual('totalSkills').get(function() {
  return this.specialAttacks?.length || 0;
});

/**
 * Application success rate
 */
userSchema.virtual('questSuccessRate').get(function() {
  if (!this.questLog || this.questLog.length === 0) return 0;
  const victories = this.questLog.filter(q => q.status === 'victorious').length;
  return Math.round((victories / this.questLog.length) * 100);
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-SAVE MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password with salt rounds of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Update title based on level
 */
userSchema.pre('save', function(next) {
  if (this.isModified('level')) {
    if (this.level >= 100) this.title = HERO_TITLES.LEVEL_100;
    else if (this.level >= 76) this.title = HERO_TITLES.LEVEL_76;
    else if (this.level >= 51) this.title = HERO_TITLES.LEVEL_51;
    else if (this.level >= 36) this.title = HERO_TITLES.LEVEL_36;
    else if (this.level >= 21) this.title = HERO_TITLES.LEVEL_21;
    else if (this.level >= 11) this.title = HERO_TITLES.LEVEL_11;
    else if (this.level >= 6) this.title = HERO_TITLES.LEVEL_6;
    else this.title = HERO_TITLES.LEVEL_1;
  }
  next();
});

/**
 * Check for level up when XP changes
 */
userSchema.pre('save', function(next) {
  if (this.isModified('experiencePoints')) {
    const xpNeeded = Math.floor(100 * Math.pow(this.level, 1.5));
    while (this.experiencePoints >= xpNeeded && this.level < 100) {
      this.level += 1;
    }
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSTANCE METHODS - Hero Abilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compare entered password with hashed password
 * @param {string} enteredPassword - Password to verify
 * @returns {Promise<boolean>} - Whether password matches
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT access token
 * @returns {string} - Signed JWT token
 */
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      heroClass: this.heroClass
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate refresh token
 * @returns {string} - Refresh token
 */
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // Store refresh token
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  return refreshToken;
};

/**
 * Award XP to the hero
 * @param {number} amount - XP to award
 * @param {string} reason - Reason for XP award
 * @returns {object} - Level up info if applicable
 */
userSchema.methods.awardXp = async function(amount, reason = '') {
  const previousLevel = this.level;
  this.experiencePoints += amount;
  
  await this.save();
  
  const leveledUp = this.level > previousLevel;
  
  return {
    xpAwarded: amount,
    reason,
    newTotalXp: this.experiencePoints,
    leveledUp,
    previousLevel,
    currentLevel: this.level,
    newTitle: leveledUp ? this.title : null
  };
};

/**
 * Award gold coins
 * @param {number} amount - Gold to award
 * @returns {number} - New gold total
 */
userSchema.methods.awardGold = async function(amount) {
  this.goldCoins += amount;
  await this.save();
  return this.goldCoins;
};

/**
 * Add a special attack (skill)
 * @param {object} skillData - Skill information
 */
userSchema.methods.learnSpecialAttack = async function(skillData) {
  this.specialAttacks.push(skillData);
  // Award XP for learning new skill
  await this.awardXp(25, `Learned new skill: ${skillData.name}`);
  return this.specialAttacks[this.specialAttacks.length - 1];
};

/**
 * Calculate survival probability against a quest (job)
 * @param {object} questRequirements - Job requirements
 * @returns {number} - Probability percentage
 */
userSchema.methods.calculateSurvivalProbability = function(questRequirements) {
  let matchScore = 0;
  let totalWeight = 0;
  
  // Check required skills match
  if (questRequirements.requiredSkills) {
    questRequirements.requiredSkills.forEach(reqSkill => {
      totalWeight += reqSkill.weight || 1;
      const heroSkill = this.specialAttacks.find(
        s => s.realSkillName.toLowerCase() === reqSkill.name.toLowerCase()
      );
      if (heroSkill) {
        // Score based on power level match
        const levelMatch = Math.min(heroSkill.powerLevel / (reqSkill.minLevel || 50), 1);
        matchScore += levelMatch * (reqSkill.weight || 1);
      }
    });
  }
  
  // Check experience years
  if (questRequirements.minExperienceYears) {
    totalWeight += 2;
    const totalYears = this.battleHistory.reduce((sum, battle) => {
      const end = battle.campaignEnd || new Date();
      const start = battle.campaignStart;
      return sum + ((end - start) / (365 * 24 * 60 * 60 * 1000));
    }, 0);
    const expMatch = Math.min(totalYears / questRequirements.minExperienceYears, 1);
    matchScore += expMatch * 2;
  }
  
  // Add luck factor (small random bonus based on luck stat)
  const luckBonus = (this.stats.luck / 100) * 5;
  
  const probability = totalWeight > 0 
    ? Math.min(100, Math.round((matchScore / totalWeight) * 100 + luckBonus))
    : 50;
  
  return probability;
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC METHODS - Guild Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find heroes by class
 * @param {string} heroClass - The hero class to search for
 */
userSchema.statics.findByClass = function(heroClass) {
  return this.find({ heroClass, accountStatus: ACCOUNT_STATUS.ACTIVE });
};

/**
 * Get leaderboard by XP
 * @param {number} limit - Number of results
 */
userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ accountStatus: ACCOUNT_STATUS.ACTIVE })
    .select('heroName heroClass level experiencePoints title avatar')
    .sort({ experiencePoints: -1 })
    .limit(limit);
};

/**
 * Find potential mentors (Elders) for a hero
 * @param {string} heroClass - Hero's class
 */
userSchema.statics.findElders = function(heroClass) {
  return this.find({
    role: USER_ROLES.ELDER,
    heroClass,
    accountStatus: ACCOUNT_STATUS.ACTIVE
  }).select('heroName heroClass level title specialAttacks heroicSummary avatar');
};

/**
 * Find heroes for skill barter matching
 * @param {string} skillWanted - Skill the user wants to learn
 * @param {string} skillOffered - Skill the user can teach
 */
userSchema.statics.findBarterMatches = function(skillWanted, skillOffered) {
  return this.find({
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    'specialAttacks.realSkillName': { $regex: new RegExp(skillWanted, 'i') },
    'barterOffers': {
      $elemMatch: {
        skillWanted: { $regex: new RegExp(skillOffered, 'i') },
        status: 'open'
      }
    }
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT MODEL
// ═══════════════════════════════════════════════════════════════════════════════

const User = mongoose.model('User', userSchema);

module.exports = User;

// Export enums for use in other modules
module.exports.HERO_CLASSES = HERO_CLASSES;
module.exports.HERO_TITLES = HERO_TITLES;
module.exports.ACCOUNT_STATUS = ACCOUNT_STATUS;
module.exports.USER_ROLES = USER_ROLES;
