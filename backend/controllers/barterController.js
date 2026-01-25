const { Barter, User } = require('../models');

// @desc    Get all barters
// @route   GET /api/barter
// @access  Public
exports.getAllBarters = async (req, res) => {
  try {
    const barters = await Barter.findAll({
      where: { status: 'Open' },
      include: [{
        model: User,
        as: 'merchant',
        attributes: ['heroName', 'avatar', 'heroClass']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: barters.length,
      data: barters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The Market is closed.',
      error: error.message
    });
  }
};

// @desc    Create a new barter
// @route   POST /api/barter
// @access  Private
exports.createBarter = async (req, res) => {
  try {
    req.body.merchantId = req.user.id;

    const barter = await Barter.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Your wares are now on display.',
      data: barter
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to open shop.',
      error: error.message
    });
  }
};

// @desc    Make an offer on a barter
// @route   POST /api/barter/:id/offer
// @access  Private
exports.makeOffer = async (req, res) => {
  try {
    const { message } = req.body;
    const barter = await Barter.findByPk(req.params.id);

    if (!barter) {
      return res.status(404).json({
        success: false,
        message: 'This stall is empty.'
      });
    }

    if (barter.merchantId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot trade with yourself!'
      });
    }

    const offers = barter.offers || [];
    offers.push({
      trader: req.user.id,
      message: message || "I accept your terms.",
      createdAt: new Date()
    });

    barter.offers = [...offers];
    barter.status = 'Negotiating';
    await barter.save();

    res.status(200).json({
      success: true,
      message: 'Offer made!',
      data: barter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
