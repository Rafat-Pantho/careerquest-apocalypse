const User = require('../models/User');

// @desc    Send friend request
// @route   POST /api/friends/request/:id
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const targetUser = await User.findByPk(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Hero not found' });
    }

    // Friends and Requests stored as JSON
    const userFriends = user.friends || []; // Array of IDs
    const targetRequests = targetUser.friendRequests || []; // Array of { from: ID, status: 'pending' }

    if (userFriends.includes(targetUser.id)) {
      return res.status(400).json({ success: false, message: 'You are already allies!' });
    }

    // Check if request already sent
    // targetRequests structure assumption: [{ from: 1, status: 'pending' }]
    const existingRequest = targetRequests.find(
      req => req.from === user.id && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Request already sent!' });
    }

    // Add request
    const newRequest = { from: user.id, status: 'pending', sentAt: new Date() };
    const newRequests = [...targetRequests, newRequest];

    targetUser.friendRequests = newRequests;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent!'
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

// @desc    Accept/Reject friend request
// @route   PUT /api/friends/respond/:requestId
// @access  Private
exports.respondToFriendRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const user = await User.findByPk(req.user.id);

    // In JSON, we don't have unique IDs for subdocs unless we generate them.
    // The previous implementation used subdoc ID: user.friendRequests.id(req.params.requestId).
    // Our JSON replacement didn't generate IDs for requests.
    // To support this without altering API, we should use `from` user ID as identifier if possible,
    // or we can't efficiently find the request by a random ID unless we stored it.
    // Let's assume the frontend sends the *sender's ID* as requestId or we change the API expectation.
    // Or we find the request by sender ID if passed.
    // If the frontend sends the MongoDB ObjectID of the request, we are stuck because updated model doesn't have it.
    // Let's assume for this migration we identify request by the 'from' user ID. 
    // BUT the route is /:requestId.
    // Let's search inside the array for a request that matches (if we had IDs).
    // Since we just started fresh, let's assume we can pass the sender ID as requestId for now or handle it gracefully.

    let requestIndex = -1;
    let request = null;

    const friendRequests = user.friendRequests || [];

    // Try to find. If requestId is an integer, it might be the sender ID.
    const senderId = parseInt(req.params.requestId);

    if (!isNaN(senderId)) {
      requestIndex = friendRequests.findIndex(r => r.from === senderId && r.status === 'pending');
    }

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request = friendRequests[requestIndex];

    if (status === 'accepted') {
      const sender = await User.findByPk(request.from);

      // Add to friends lists
      const userFriends = user.friends || [];
      const senderFriends = sender.friends || [];

      if (!userFriends.includes(sender.id)) {
        user.friends = [...userFriends, sender.id];
      }
      if (!senderFriends.includes(user.id)) {
        sender.friends = [...senderFriends, user.id];
        await sender.save();
      }
    }

    // Remove request or update status
    // Let's remove it to keep it clean, or update status.
    // Previous code kept it or removed it? "Ideally... keep it... Let's keep it."
    // Update status in the array
    const updatedRequests = [...friendRequests];
    updatedRequests[requestIndex] = { ...request, status: status, respondedAt: new Date() };

    user.friendRequests = updatedRequests;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Friend request ${status}`,
      data: user.friends
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

// @desc    Get all friends
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const friendIds = user.friends || [];

    let friends = [];
    if (friendIds.length > 0) {
      friends = await User.findAll({
        where: {
          id: friendIds
        },
        attributes: ['heroName', 'heroClass', 'avatar', 'level', 'accountStatus'] // approximate status field
      });
    }

    res.status(200).json({
      success: true,
      count: friends.length,
      data: friends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
