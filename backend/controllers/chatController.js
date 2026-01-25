const { Message, User } = require('../models');

// @desc    Get chat history for a room
// @route   GET /api/chat/:room
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { room } = req.params;

    const messages = await Message.findAll({
      where: { room },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['heroName', 'avatar', 'heroClass', 'level']
      }],
      order: [['createdAt', 'ASC']], // Oldest first (for chat history scroll)
      limit: 50
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The archives are silent.',
      error: error.message
    });
  }
};
