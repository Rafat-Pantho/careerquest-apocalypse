const Bounty = require('../models/Bounty');

// @desc    Get all bounties
// @route   GET /api/bounties
// @access  Public
exports.getAllBounties = async (req, res) => {
  try {
    const bounties = await Bounty.find({ status: 'Open' })
      .populate('postedBy', 'heroName avatar heroClass')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bounties.length,
      data: bounties
    });
  } catch (error) {
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
    const bounty = await Bounty.findById(req.params.id)
      .populate('postedBy', 'heroName avatar heroClass')
      .populate('applicants.mercenary', 'heroName avatar heroClass');

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

    const bounty = await Bounty.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Bounty posted! Mercenaries will arrive soon.',
      data: bounty
    });
  } catch (error) {
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
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
      return res.status(404).json({
        success: false,
        message: 'Bounty not found'
      });
    }

    // Check if already applied
    const alreadyApplied = bounty.applicants.find(
      app => app.mercenary.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already offered your sword for this bounty!'
      });
    }

    bounty.applicants.push({
      mercenary: req.user.id,
      message: message || "I am ready to serve."
    });

    await bounty.save();

    res.status(200).json({
      success: true,
      message: 'Your offer has been sent to the patron.',
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
