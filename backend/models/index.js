const { sequelize } = require('../config/database');
const User = require('./User');
const Quest = require('./Quest');
const Message = require('./Message');
const Guild = require('./Guild');
const BossBattle = require('./BossBattle');
const Barter = require('./Barter');
const Bounty = require('./Bounty');
const Mentorship = require('./Mentorship');

// ═══════════════════════════════════════════════════════════════════════════════
// ASSOCIATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// User <-> Guild
Guild.hasMany(User, { foreignKey: 'guildId', as: 'memberList' });
User.belongsTo(Guild, { foreignKey: 'guildId', as: 'guild' });

// Guild Leader
Guild.belongsTo(User, { foreignKey: 'leaderId', as: 'leader' });

// User <-> Quest (Posted By)
Quest.belongsTo(User, { foreignKey: 'postedBy', as: 'recruiter' });
User.hasMany(Quest, { foreignKey: 'postedQuests' });

// Message <-> User
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });

// Barter <-> User
Barter.belongsTo(User, { foreignKey: 'merchantId', as: 'merchant' });
User.hasMany(Barter, { foreignKey: 'merchantId', as: 'barterListings' });

// Bounty <-> User
Bounty.belongsTo(User, { foreignKey: 'postedBy', as: 'poster' });
User.hasMany(Bounty, { foreignKey: 'postedBy', as: 'postedBounties' });

Bounty.belongsTo(User, { foreignKey: 'assignedTo', as: 'hunter' });
User.hasMany(Bounty, { foreignKey: 'assignedTo', as: 'assignedBounties' });

// Mentorship <-> User
Mentorship.belongsTo(User, { foreignKey: 'summonerId', as: 'summoner' });
User.hasMany(Mentorship, { foreignKey: 'summonerId', as: 'mentorshipRequests' });

Mentorship.belongsTo(User, { foreignKey: 'elderId', as: 'elder' });
User.hasMany(Mentorship, { foreignKey: 'elderId', as: 'mentorshipsProviding' });


module.exports = {
    sequelize,
    User,
    Quest,
    Message,
    Guild,
    BossBattle,
    Barter,
    Bounty,
    Mentorship
};
