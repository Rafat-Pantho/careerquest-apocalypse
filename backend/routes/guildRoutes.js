const express = require('express');
const {
  createGuild,
  getAllGuilds,
  getGuildById,
  joinGuild
} = require('../controllers/guildController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAllGuilds)
  .post(protect, createGuild);

router.route('/:id')
  .get(getGuildById);

router.route('/:id/join')
  .post(protect, joinGuild);

module.exports = router;
