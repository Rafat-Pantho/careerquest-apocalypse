const express = require('express');
const router = express.Router();
const { getBattles, getBattle, attackBoss } = require('../controllers/bossBattleController');
const { protect } = require('../middleware/auth');

router.get('/', getBattles);
router.get('/:id', getBattle);
router.post('/:id/attack', protect, attackBoss);

module.exports = router;
