const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A guild must have a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Guild name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Describe your guild, master'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  level: {
    type: Number,
    default: 1
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Guild', guildSchema);
