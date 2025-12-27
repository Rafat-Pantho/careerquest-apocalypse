const express = require('express');
const router = express.Router();
const {
  getAllQuests,
  getQuestById,
  createQuest,
  updateQuest,
  deleteQuest,
  applyForQuest,
  calculateSurvivalProbability,
  getQuestsWithProbability
} = require('../controllers/questController');
const { protect } = require('../middleware/auth');

// Get quests with survival probability (must be before /:id route)
router.get('/with-probability', protect, getQuestsWithProbability);

router.route('/')
  .get(getAllQuests)
  .post(protect, createQuest);

router.route('/:id')
  .get(getQuestById)
  .put(protect, updateQuest)
  .delete(protect, deleteQuest);

router.route('/:id/apply')
  .post(protect, applyForQuest);

router.route('/:id/survival-probability')
  .post(protect, calculateSurvivalProbability);

module.exports = router;
