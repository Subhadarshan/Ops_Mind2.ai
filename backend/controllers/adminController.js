const User = require('../models/User');
const Leave = require('../models/Leave');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/admin/users
 * @access  ADMIN
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        // Support optional role filter: ?role=EMPLOYEE
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role.toUpperCase();
        }

        const users = await User.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a user (Admin only, cannot delete self)
 * @route   DELETE /api/admin/user/:id
 * @access  ADMIN
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const targetId = req.params.id;

        // Prevent admin from deleting themselves
        if (targetId === req.user._id.toString()) {
            throw new AppError('You cannot delete your own account.', 400);
        }

        const user = await User.findById(targetId);
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        // Also remove all leave records belonging to this user
        await Leave.deleteMany({ employeeId: targetId });

        await User.findByIdAndDelete(targetId);

        res.status(200).json({
            success: true,
            message: `User '${user.name}' and all associated leave records deleted.`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get system-wide statistics
 * @route   GET /api/admin/stats
 * @access  ADMIN
 */
exports.getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves] =
            await Promise.all([
                User.countDocuments(),
                Leave.countDocuments(),
                Leave.countDocuments({ status: 'PENDING' }),
                Leave.countDocuments({ status: 'APPROVED' }),
                Leave.countDocuments({ status: 'REJECTED' }),
            ]);

        // Role breakdown
        const [totalAdmins, totalHR, totalEmployees] = await Promise.all([
            User.countDocuments({ role: 'ADMIN' }),
            User.countDocuments({ role: 'HR' }),
            User.countDocuments({ role: 'EMPLOYEE' }),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    admins: totalAdmins,
                    hr: totalHR,
                    employees: totalEmployees,
                },
                leaves: {
                    total: totalLeaves,
                    pending: pendingLeaves,
                    approved: approvedLeaves,
                    rejected: rejectedLeaves,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
