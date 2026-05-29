const express = require('express');
const router = express.Router();
const {
    startConversation,
    getConversations,
    getMessages,
    sendMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/conversations', startConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/messages', sendMessage);

module.exports = router;