const express = require('express');
const {
  getCVData,
  updateCVData,
  generatePDF,
  getCVPreview
} = require('../controllers/cvController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/data', getCVData);
router.put('/data', updateCVData);
router.get('/generate-pdf', generatePDF);
router.get('/preview', getCVPreview);

module.exports = router;
