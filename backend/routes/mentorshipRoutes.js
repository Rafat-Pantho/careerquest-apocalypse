const express = require('express');
const router = express.Router();
const {
  getElders,
  summonElder,
  getMyRituals,
  respondToSummon,
  completeMentorship,
  getPendingRequests,
  becomeElder
} = require('../controllers/mentorshipController');
const { protect } = require('../middleware/auth');

router.get('/elders', getElders);
router.post('/summon', protect, summonElder);
router.get('/my-rituals', protect, getMyRituals);
router.get('/pending', protect, getPendingRequests);
router.post('/become-elder', protect, becomeElder);
router.put('/:id/respond', protect, respondToSummon);
router.put('/:id/complete', protect, completeMentorship);

module.exports = router;
