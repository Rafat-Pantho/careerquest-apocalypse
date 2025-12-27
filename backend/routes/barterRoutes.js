const express = require('express');
const router = express.Router();
const {
  getAllBarters,
  createBarter,
  makeOffer
} = require('../controllers/barterController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getAllBarters)
  .post(protect, createBarter);

router.route('/:id/offer')
  .post(protect, makeOffer);

module.exports = router;
