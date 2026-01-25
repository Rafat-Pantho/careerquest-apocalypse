/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Mentorship Model - The Summoning Circle
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Represents the connection between a Student (Summoner) and an Alumni (Elder).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  summoner: { // The Student
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  elder: { // The Alumni/Mentor
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  incantation: { // The message/request
    type: String,
    required: [true, 'You must speak the incantation to summon an Elder!']
  },
  topic: { // What they want help with
    type: String,
    required: true
  },
  goals: [{ // Specific goals for the mentorship
    type: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  responseMessage: { // Elder's response message
    type: String
  },
  respondedAt: Date,
  completedAt: Date,
  feedback: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  sessions: [{ // Log of meetings
    date: Date,
    notes: String,
    xpAwarded: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
