const Bounty = require('../models/Bounty');
const User = require('../models/User');

// @desc    Get all bounties
// @route   GET /api/bounties
// @access  Public
exports.getAllBounties = async (req, res) => {
  try {
    const bounties = await Bounty.findAll({
      where: { status: 'Open' },
      include: [{
        model: User,
        as: 'poster',
        attributes: ['heroName', 'avatar', 'heroClass']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bounties.length,
      data: bounties
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'The Bounty Board is empty...',
      error: error.message
    });
  }
};

// @desc    Get single bounty
// @route   GET /api/bounties/:id
// @access  Public
exports.getBountyById = async (req, res) => {
  try {
    const bounty = await Bounty.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'poster',
        attributes: ['heroName', 'avatar', 'heroClass']
      }]
    });

    if (!bounty) {
      return res.status(404).json({
        success: false,
        message: 'Bounty not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bounty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a new bounty
// @route   POST /api/bounties
// @access  Private
exports.createBounty = async (req, res) => {
  try {
    req.body.postedBy = req.user.id;

    // Map reward nested object to flat fields
    // Mongoose: reward: { amount, currency, frequency }
    // Sequelize: reward_amount, reward_currency, reward_frequency

    const { reward, ...rest } = req.body;
    let bountyData = { ...rest, postedBy: req.user.id };

    if (reward) {
      bountyData.reward_amount = reward.amount;
      bountyData.reward_currency = reward.currency;
      bountyData.reward_frequency = reward.frequency;
    }

    const bounty = await Bounty.create(bountyData);

    res.status(201).json({
      success: true,
      message: 'Bounty posted! Mercenaries will arrive soon.',
      data: bounty
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Failed to post bounty.',
      error: error.message
    });
  }
};

// @desc    Apply for a bounty
// @route   POST /api/bounties/:id/apply
// @access  Private
exports.applyForBounty = async (req, res) => {
  try {
    const { message } = req.body;
    const bounty = await Bounty.findByPk(req.params.id);

    if (!bounty) {
      return res.status(404).json({
        success: false,
        message: 'Bounty not found'
      });
    }

    // JSON check
    const applicants = bounty.applicants || [];
    const alreadyApplied = applicants.find(
      app => app.mercenary === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already offered your sword for this bounty!'
      });
    }

    const newApp = {
      mercenary: req.user.id,
      message: message || "I am ready to serve.",
      appliedAt: new Date()
    };

    const newApplicants = [...applicants, newApp];
    bounty.applicants = newApplicants;

    await bounty.save();

    res.status(200).json({
      success: true,
      message: 'Your offer has been sent to the patron.',
      data: bounty
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
