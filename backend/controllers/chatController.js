const Message = require('../models/Message');
const { User } = require('../models');

// @desc    Get chat history for a room
// @route   GET /api/chat/:room
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { room } = req.params;

    // In Sequelize we typically sort DESC to get latest, but chat history usually wants oldest first or latest last?
    // Mongoose had .sort({ createdAt: 1 }) -> Oldest first.
    // .limit(50) on sorted oldest first means the FIRST 50 messages ever sent. That's probably a bug in original code or intended behavior.
    // Usually chat gets LATEST 50 messages.
    // If we want latest 50, we sort DESC, limit 50, then reverse on client or re-sort ASC.
    // But adhering to 'Oldest first' with limit 50 implies we get the first 50 messages.
    // Let's assume original intent was "Last 50 messages" as per comment.
    // To get last 50, we sort DESC, limit 50, then reverse.
    // But original code was .sort({ createdAt: 1 }).limit(50). This really fetches the first 50 messages unless I misunderstand Mongoose default cursor behavior on some versions (unlikely).
    // Wait, the comment says `// Limit to last 50 messages`. This contradicts the code `sort({ createdAt: 1 })`.
    // Maybe they meant sort({ createdAt: -1 })?
    // Let's implement "Last 50 messages" logically: Sort DESC, Limit 50, then correct order. 
    // OR stick to original code implementation if we want to be safe (First 50).
    // Let's do logical "Recent 50".

    const messages = await Message.findAll({
      where: { room },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['heroName', 'avatar', 'heroClass', 'level']
      }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Reverse to show oldest to newest
    const sortedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      count: sortedMessages.length,
      data: sortedMessages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'The archives are silent.',
      error: error.message
    });
  }
};
