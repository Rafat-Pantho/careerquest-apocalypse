const Guild = require('../models/Guild');
const User = require('../models/User');

// @desc    Create a new guild
// @route   POST /api/guilds
// @access  Private
exports.createGuild = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user is already in a guild
    const user = await User.findById(req.user.id);
    if (user.guild) {
      return res.status(400).json({
        success: false,
        message: 'You are already pledged to a guild!'
      });
    }

    const guild = await Guild.create({
      name,
      description,
      leader: req.user.id,
      members: [req.user.id]
    });

    // Update user
    user.guild = guild._id;
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
    const guilds = await Guild.find()
      .populate('leader', 'heroName heroClass')
      .select('name description members level experiencePoints');

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
    const guild = await Guild.findById(req.params.id)
      .populate('leader', 'heroName heroClass avatar')
      .populate('members', 'heroName heroClass avatar level');

    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild not found'
      });
    }

    res.status(200).json({
      success: true,
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

// @desc    Join a guild
// @route   POST /api/guilds/:id/join
// @access  Private
exports.joinGuild = async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild not found' });
    }

    if (user.guild) {
      return res.status(400).json({ success: false, message: 'You are already in a guild!' });
    }

    // Add to guild
    guild.members.push(user._id);
    await guild.save();

    // Update user
    user.guild = guild._id;
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
