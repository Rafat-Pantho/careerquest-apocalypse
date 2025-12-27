const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  consultOracle, 
  startInterview, 
  evaluateAnswer, 
  getInterviewSummary,
  reviewResume,
  getInterviewTypes 
} = require('../controllers/oracleController');

// Public routes
router.post('/consult', consultOracle);
router.get('/interview/types', getInterviewTypes);

// Protected routes (require authentication)
router.post('/interview/start', protect, startInterview);
router.post('/interview/answer', protect, evaluateAnswer);
router.post('/interview/summary', protect, getInterviewSummary);
router.post('/resume-review', protect, reviewResume);

module.exports = router;
