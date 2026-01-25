const { Bounty, User } = require('../models');

// Helper to manually populate applicants from JSON
const populateApplicants = async (bounty) => {
  if (!bounty) return null;
  const bountyData = bounty.toJSON();
  if (bountyData.applicants && bountyData.applicants.length > 0) {
    const mercenaryIds = bountyData.applicants.map(app => app.mercenary).filter(id => id);
    const mercenaries = await User.findAll({
      where: { id: mercenaryIds },
      attributes: ['id', 'heroName', 'avatar', 'heroClass']
    });

    bountyData.applicants = bountyData.applicants.map(app => {
      const mercenary = mercenaries.find(m => m.id === app.mercenary);
      return { ...app, mercenary: mercenary || app.mercenary };
    });
  }
  return bountyData;
};

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

    const validBounties = bounties.map(b => {
      const bJson = b.toJSON();
      bJson.postedBy = bJson.poster;
      delete bJson.poster;
      return bJson;
    });

    res.status(200).json({
      success: true,
      count: validBounties.length,
      data: validBounties
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

    const bountyParam = await populateApplicants(bounty);
    bountyParam.postedBy = bountyParam.poster;
    delete bountyParam.poster;

    res.status(200).json({
      success: true,
      data: bountyParam
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
    req.body.postedBy = req.user.id; // ensure correct FK

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
    const bounty = await Bounty.findByPk(req.params.id);

    if (!bounty) {
      return res.status(404).json({
        success: false,
        message: 'Bounty not found'
      });
    }

    const applicants = bounty.applicants || [];

    // Check if already applied
    const alreadyApplied = applicants.find(
      app => app.mercenary === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already offered your sword for this bounty!'
      });
    }

    applicants.push({
      mercenary: req.user.id,
      message: message || "I am ready to serve.",
      appliedAt: new Date()
    });

    bounty.applicants = [...applicants];
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
