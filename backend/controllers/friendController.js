const User = require('../models/User');

// @desc    Send friend request
// @route   POST /api/friends/request/:id
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Hero not found' });
    }

    if (user.friends.includes(targetUser._id)) {
      return res.status(400).json({ success: false, message: 'You are already allies!' });
    }

    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === user._id.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Request already sent!' });
    }

    // Add request
    targetUser.friendRequests.push({ from: user._id });
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Accept/Reject friend request
// @route   PUT /api/friends/respond/:requestId
// @access  Private
exports.respondToFriendRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const user = await User.findById(req.user.id);
    
    const request = user.friendRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (status === 'accepted') {
      const sender = await User.findById(request.from);
      
      // Add to friends lists
      user.friends.push(sender._id);
      sender.friends.push(user._id);
      
      await sender.save();
    }

    // Remove request (or mark as processed)
    request.status = status;
    // Ideally we might want to keep history, but for now let's just remove it to keep array clean
    // Or keep it with status updated. Let's keep it.
    
    await user.save();

    res.status(200).json({
      success: true,
      message: `Friend request ${status}`,
      data: user.friends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all friends
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'heroName heroClass avatar level status');

    res.status(200).json({
      success: true,
      count: user.friends.length,
      data: user.friends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
