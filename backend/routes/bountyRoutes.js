const express = require('express');
const router = express.Router();
const {
  getAllBounties,
  getBountyById,
  createBounty,
  applyForBounty
} = require('../controllers/bountyController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getAllBounties)
  .post(protect, createBounty);

router.route('/:id')
  .get(getBountyById);

router.route('/:id/apply')
  .post(protect, applyForBounty);

module.exports = router;
