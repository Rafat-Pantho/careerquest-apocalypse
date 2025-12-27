const express = require('express');
const {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFriends);
router.post('/request/:id', sendFriendRequest);
router.put('/respond/:requestId', respondToFriendRequest);

module.exports = router;
