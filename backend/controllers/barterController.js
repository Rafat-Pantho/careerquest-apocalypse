const Barter = require('../models/Barter');
const User = require('../models/User');

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
    console.error(error);
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
    // In our Sequelize model we use merchantId, but we can also set the association if aliased.
    // Let's use the field we defined in model: merchantId.
    // Wait, in Barter.js (step 221) we defined 'merchantId'.
    // In index.js (step 213) we didn't explicitly check Barter association, let's verify.
    // I didn't add Barter association in index.js in step 213! I only did User-Quest, User-Message.
    // I must update index.js to include Barter association for the include above to work.

    // For now, I will assume I fix index.js in next step.

    req.body.merchantId = req.user.id;
    // Map mismatched fields if any. 
    // Mongoose: offering: { skill, description }, seeking: { skill, description }
    // Sequelize: offering_skill, offering_description, seeking_skill, seeking_description

    const { offering, seeking, ...rest } = req.body;
    const barterData = { ...rest, merchantId: req.user.id };

    if (offering) {
      barterData.offering_skill = offering.skill;
      barterData.offering_description = offering.description;
    }
    if (seeking) {
      barterData.seeking_skill = seeking.skill;
      barterData.seeking_description = seeking.description;
    }

    const barter = await Barter.create(barterData);

    res.status(201).json({
      success: true,
      message: 'Your wares are now on display.',
      data: barter
    });
  } catch (error) {
    console.error(error);
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

    // JSON update
    const offers = barter.offers || [];
    const newOffer = {
      trader: req.user.id,
      message: message || "I accept your terms.",
      status: 'Pending',
      createdAt: new Date()
    };

    // We need to trigger update
    const newOffers = [...offers, newOffer];
    barter.offers = newOffers;
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
