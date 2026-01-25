const { sequelize } = require('../config/database');
const User = require('./User');
const Quest = require('./Quest');
const Message = require('./Message');
const Barter = require('./Barter');
const BossBattle = require('./BossBattle');
const Bounty = require('./Bounty');
const Guild = require('./Guild');
const Mentorship = require('./Mentorship');

// Define Associations

// User & Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User & Quest
User.hasMany(Quest, { foreignKey: 'postedBy', as: 'postedQuests' });
Quest.belongsTo(User, { foreignKey: 'postedBy', as: 'poster' });

// User & Barter
User.hasMany(Barter, { foreignKey: 'merchantId', as: 'barters' });
Barter.belongsTo(User, { foreignKey: 'merchantId', as: 'merchant' });

// User & Bounty
User.hasMany(Bounty, { foreignKey: 'postedBy', as: 'postedBounties' });
Bounty.belongsTo(User, { foreignKey: 'postedBy', as: 'poster' });

// Guild & User
Guild.belongsTo(User, { foreignKey: 'leaderId', as: 'leader' });
// We want User to belong to Guild (members)?
// If users have `guildId` column:
User.belongsTo(Guild, { foreignKey: 'guildId', as: 'guild' });
Guild.hasMany(User, { foreignKey: 'guildId', as: 'guildMembers' });

// Mentorship & User
Mentorship.belongsTo(User, { foreignKey: 'summonerId', as: 'summoner' });
Mentorship.belongsTo(User, { foreignKey: 'elderId', as: 'elder' });

// Quest Applicants (Many-to-Many via Application table - conceptual, or use JSON for now as per Quest model)
// For now, Quest model has `applicants` as JSON, so no direct association needed unless we normalize.
// Keeping it simple as requested by the migration style seen so far (JSON fields).

// Export all models
module.exports = {
    sequelize,
    User,
    Quest,
    Message,
    Barter,
    BossBattle,
    Bounty,
    Guild,
    Mentorship
};
