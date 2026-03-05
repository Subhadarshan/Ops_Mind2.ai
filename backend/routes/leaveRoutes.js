const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ── Employee routes ──
router.post('/apply', authMiddleware, roleMiddleware('EMPLOYEE'), leaveController.applyLeave);
router.get('/my-leaves', authMiddleware, roleMiddleware('EMPLOYEE'), leaveController.getMyLeaves);

// ── HR & Admin routes ──
router.get('/all', authMiddleware, roleMiddleware('HR', 'ADMIN'), leaveController.getAllLeaves);
router.put('/:id/approve', authMiddleware, roleMiddleware('HR', 'ADMIN'), leaveController.approveLeave);
router.put('/:id/reject', authMiddleware, roleMiddleware('HR', 'ADMIN'), leaveController.rejectLeave);

module.exports = router;
