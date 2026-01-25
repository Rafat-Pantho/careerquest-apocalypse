const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message cannot be empty']
  },
  room: {
    type: String,
    default: 'tavern'
    // Can be 'tavern', guild ID, or DM room ID (e.g., 'dm_userId1_userId2')
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
