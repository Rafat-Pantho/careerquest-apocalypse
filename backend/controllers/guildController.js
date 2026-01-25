const { Guild, User } = require('../models');

// Helper to manually populate members from JSON
const populateMembers = async (guild) => {
  if (!guild) return null;
  const guildData = guild.toJSON();
  if (guildData.members && guildData.members.length > 0) {
    const memberIds = guildData.members;
    const members = await User.findAll({
      where: { id: memberIds },
      attributes: ['id', 'heroName', 'heroClass', 'avatar', 'level']
    });

    // Sort or map? Usually just replace the list of IDs with objects
    guildData.members = members.map(m => m.toJSON());
  }
  return guildData;
};

// @desc    Create a new guild
// @route   POST /api/guilds
// @access  Private
exports.createGuild = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user is already in a guild
    const user = await User.findByPk(req.user.id);
    if (user.guildId) {
      return res.status(400).json({
        success: false,
        message: 'You are already pledged to a guild!'
      });
    }

    const guild = await Guild.create({
      name,
      description,
      leaderId: req.user.id,
      members: [req.user.id]
    });

    // Update user
    user.guildId = guild.id;
    await user.save();

    res.status(201).json({
      success: true,
      data: guild
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to establish guild foundation.',
      error: error.message
    });
  }
};

// @desc    Get all guilds
// @route   GET /api/guilds
// @access  Public
exports.getAllGuilds = async (req, res) => {
  try {
    const guilds = await Guild.findAll({
      include: [{
        model: User,
        as: 'leader',
        attributes: ['heroName', 'heroClass']
      }],
      attributes: ['id', 'name', 'description', 'members', 'level', 'experiencePoints']
    });

    res.status(200).json({
      success: true,
      count: guilds.length,
      data: guilds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single guild
// @route   GET /api/guilds/:id
// @access  Public
exports.getGuildById = async (req, res) => {
  try {
    const guild = await Guild.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'leader',
        attributes: ['heroName', 'heroClass', 'avatar']
      }]
    });

    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild not found'
      });
    }

    const guildData = await populateMembers(guild);

    res.status(200).json({
      success: true,
      data: guildData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Join a guild
// @route   POST /api/guilds/:id/join
// @access  Private
exports.joinGuild = async (req, res) => {
  try {
    const guild = await Guild.findByPk(req.params.id);
    const user = await User.findByPk(req.user.id);

    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild not found' });
    }

    if (user.guildId) {
      return res.status(400).json({ success: false, message: 'You are already in a guild!' });
    }

    // Add to guild members
    const members = guild.members || [];
    members.push(user.id);
    guild.members = [...members];
    await guild.save();

    // Update user
    user.guildId = guild.id;
    await user.save();

    res.status(200).json({
      success: true,
      message: `You have pledged allegiance to ${guild.name}!`,
      data: guild
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
