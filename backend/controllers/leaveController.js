const Leave = require('../models/Leave');
const AppError = require('../utils/AppError');

/**
 * @desc    Employee applies for leave
 * @route   POST /api/leave/apply
 * @access  EMPLOYEE
 */
exports.applyLeave = async (req, res, next) => {
    try {
        const { leaveType, startDate, endDate, reason, attachment } = req.body;

        // 1. Validate required fields
        if (!leaveType || !startDate || !endDate) {
            throw new AppError('leaveType, startDate, and endDate are required.', 400);
        }

        // 2. Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new AppError('Invalid date format.', 400);
        }
        if (end <= start) {
            throw new AppError('End date must be after start date.', 400);
        }

        // 3. Create leave
        const leave = await Leave.create({
            employeeId: req.user._id,
            leaveType,
            startDate: start,
            endDate: end,
            reason: reason || '',
            attachment: attachment || null,
        });

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully.',
            leave,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Employee views their own leaves
 * @route   GET /api/leave/my-leaves
 * @access  EMPLOYEE
 */
exports.getMyLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user._id })
            .sort({ appliedAt: -1 })
            .populate('reviewedBy', 'name email role');

        res.status(200).json({
            success: true,
            count: leaves.length,
            leaves,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    HR views all leave requests
 * @route   GET /api/leave/all
 * @access  HR, ADMIN
 */
exports.getAllLeaves = async (req, res, next) => {
    try {
        // Support optional status filter: ?status=PENDING
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status.toUpperCase();
        }

        const leaves = await Leave.find(filter)
            .sort({ appliedAt: -1 })
            .populate('employeeId', 'name email department role')
            .populate('reviewedBy', 'name email role');

        res.status(200).json({
            success: true,
            count: leaves.length,
            leaves,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    HR approves a leave request
 * @route   PUT /api/leave/:id/approve
 * @access  HR, ADMIN
 */
exports.approveLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            throw new AppError('Leave request not found.', 404);
        }

        if (leave.status !== 'PENDING') {
            throw new AppError(`Cannot approve a leave that is already ${leave.status}.`, 400);
        }

        leave.status = 'APPROVED';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        await leave.save();

        // Populate for response
        await leave.populate('employeeId', 'name email department');
        await leave.populate('reviewedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Leave request approved.',
            leave,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    HR rejects a leave request
 * @route   PUT /api/leave/:id/reject
 * @access  HR, ADMIN
 */
exports.rejectLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            throw new AppError('Leave request not found.', 404);
        }

        if (leave.status !== 'PENDING') {
            throw new AppError(`Cannot reject a leave that is already ${leave.status}.`, 400);
        }

        leave.status = 'REJECTED';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        await leave.save();

        await leave.populate('employeeId', 'name email department');
        await leave.populate('reviewedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Leave request rejected.',
            leave,
        });
    } catch (error) {
        next(error);
    }
};
