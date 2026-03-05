const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ── All routes below require ADMIN role ──
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/users', adminController.getAllUsers);
router.delete('/user/:id', adminController.deleteUser);
router.get('/stats', adminController.getStats);

module.exports = router;
