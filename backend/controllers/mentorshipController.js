const { Mentorship, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all available mentors (Elders)
// @route   GET /api/mentorship/elders
// @access  Public
exports.getElders = async (req, res) => {
  try {
    const elders = await User.findAll({
      where: { role: 'elder' },
      attributes: ['id', 'heroName', 'heroClass', 'avatar', 'specialAttacks', 'heroicSummary', 'battleHistory', 'trainingGrounds', 'createdAt']
    });

    // Add some computed fields for each elder
    const eldersWithStats = elders.map(elder => {
      const e = elder.toJSON();
      return {
        ...e,
        skillCount: e.specialAttacks?.length || 0,
        experienceYears: e.battleHistory?.reduce((total, exp) => total + 2, 0) || 0, // Rough calc
        specialties: e.specialAttacks?.slice(0, 3).map(s => s.attackName) || [] // Adapt to JSON structure
      };
    });

    res.status(200).json({
      success: true,
      count: eldersWithStats.length,
      data: eldersWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The Elders are silent.',
      error: error.message
    });
  }
};

// @desc    Request mentorship (Summon Elder)
// @route   POST /api/mentorship/summon
// @access  Private
exports.summonElder = async (req, res) => {
  try {
    const { elderId, incantation, topic, goals } = req.body;

    // Check if elder exists
    const elder = await User.findByPk(elderId);
    if (!elder || elder.role !== 'elder') {
      return res.status(404).json({
        success: false,
        message: 'This Elder does not exist or is merely a novice in disguise.'
      });
    }

    // Check if there's already a pending request
    const existingRequest = await Mentorship.findOne({
      where: {
        summonerId: req.user.id,
        elderId: elderId,
        status: { [Op.in]: ['Pending', 'Active'] }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending ritual with this Elder.'
      });
    }

    const mentorship = await Mentorship.create({
      summonerId: req.user.id,
      elderId: elderId,
      incantation,
      topic,
      goals: goals || []
    });

    // Fetch created mentorship with elder info
    const populatedMentorship = await Mentorship.findByPk(mentorship.id, {
      include: [{
        model: User,
        as: 'elder',
        attributes: ['heroName', 'avatar', 'heroClass']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'The summoning ritual has begun...',
      data: populatedMentorship
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'The ritual failed.',
      error: error.message
    });
  }
};

// @desc    Get my mentorships
// @route   GET /api/mentorship/my-rituals
// @access  Private
exports.getMyRituals = async (req, res) => {
  try {
    const rituals = await Mentorship.findAll({
      where: {
        [Op.or]: [
          { summonerId: req.user.id },
          { elderId: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'summoner', attributes: ['heroName', 'avatar', 'heroClass'] },
        { model: User, as: 'elder', attributes: ['heroName', 'avatar', 'heroClass'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: rituals.length,
      data: rituals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Respond to a summoning request (Elder accepts/rejects)
// @route   PUT /api/mentorship/:id/respond
// @access  Private (Elder only)
exports.respondToSummon = async (req, res) => {
  try {
    const { status, message } = req.body;

    const mentorship = await Mentorship.findByPk(req.params.id);

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Ritual not found.'
      });
    }

    // Check if the user is the elder
    if (mentorship.elderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the Elder can respond to this summoning.'
      });
    }

    if (!['Active', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use "Active" to accept or "Rejected" to decline.'
      });
    }

    mentorship.status = status;
    if (message) {
      mentorship.responseMessage = message;
    }
    mentorship.respondedAt = new Date();

    await mentorship.save();

    // Fetch with includes for response
    const updatedMentorship = await Mentorship.findByPk(mentorship.id, {
      include: [
        { model: User, as: 'summoner', attributes: ['heroName', 'avatar'] },
        { model: User, as: 'elder', attributes: ['heroName', 'avatar'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: status === 'Active' ? 'The bond has been established!' : 'The summoning was declined.',
      data: updatedMentorship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Complete a mentorship
// @route   PUT /api/mentorship/:id/complete
// @access  Private
exports.completeMentorship = async (req, res) => {
  try {
    const { feedback, rating } = req.body;

    const mentorship = await Mentorship.findByPk(req.params.id);

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Ritual not found.'
      });
    }

    // Check if user is part of this mentorship
    if (mentorship.summonerId !== req.user.id &&
      mentorship.elderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this ritual.'
      });
    }

    mentorship.status = 'Completed';
    if (feedback) mentorship.feedback = feedback;
    if (rating) mentorship.rating = rating;
    mentorship.completedAt = new Date();

    await mentorship.save();

    res.status(200).json({
      success: true,
      message: 'The ritual has concluded. The knowledge has been transferred.',
      data: mentorship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get pending requests for an Elder
// @route   GET /api/mentorship/pending
// @access  Private (Elder)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Mentorship.findAll({
      where: {
        elderId: req.user.id,
        status: 'Pending'
      },
      include: [{
        model: User,
        as: 'summoner',
        attributes: ['heroName', 'avatar', 'heroClass', 'specialAttacks']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Become an Elder (register as mentor)
// @route   POST /api/mentorship/become-elder
// @access  Private
exports.becomeElder = async (req, res) => {
  try {
    const { specialties, availability, bio } = req.body;

    const user = await User.findByPk(req.user.id);

    // Requirements to become an Elder
    const battleHist = user.battleHistory || [];
    const specialAttacks = user.specialAttacks || [];

    const hasEnoughExperience = battleHist.length >= 1;
    const hasSkills = specialAttacks.length >= 3;

    if (!hasEnoughExperience || !hasSkills) {
      return res.status(400).json({
        success: false,
        message: 'You need at least 1 experience entry and 3 skills to become an Elder.'
      });
    }

    user.role = 'elder';
    if (bio) user.heroicSummary = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'You have ascended to Elder status! May your wisdom guide the seekers.',
      data: {
        heroName: user.heroName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The ascension ritual failed.',
      error: error.message
    });
  }
};
