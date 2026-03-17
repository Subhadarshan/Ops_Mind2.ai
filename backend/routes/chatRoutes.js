const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendMessage, clearHistory, getSuggestions } = require('../controllers/chatController');

// All chat routes require authentication
router.use(authMiddleware);

// POST /api/chat — Send a message to Gemini AI
router.post('/', sendMessage);

// GET /api/chat/suggestions — Get role-based quick suggestions
router.get('/suggestions', getSuggestions);

// DELETE /api/chat/history — Clear conversation history
router.delete('/history', clearHistory);

module.exports = router;
