const Message = require('../models/Message');

// @desc    Get chat history for a room
// @route   GET /api/chat/:room
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { room } = req.params;
    
    const messages = await Message.find({ room })
      .populate('sender', 'heroName avatar heroClass level')
      .sort({ createdAt: 1 }) // Oldest first
      .limit(50); // Limit to last 50 messages

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
