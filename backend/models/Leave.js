const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Employee reference is required'],
        },
        leaveType: {
            type: String,
            required: [true, 'Leave type is required'],
            enum: {
                values: ['Annual Leave', 'Sick Leave', 'Personal', 'Unpaid', 'Maternity', 'Paternity'],
                message: 'Invalid leave type',
            },
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        reason: {
            type: String,
            trim: true,
            maxlength: [500, 'Reason must be at most 500 characters'],
            default: '',
        },
        attachment: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: {
                values: ['PENDING', 'APPROVED', 'REJECTED'],
                message: 'Status must be PENDING, APPROVED, or REJECTED',
            },
            default: 'PENDING',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// ── Validate endDate > startDate ──
leaveSchema.pre('validate', function (next) {
    if (this.startDate && this.endDate && this.endDate <= this.startDate) {
        this.invalidate('endDate', 'End date must be after start date');
    }
    next();
});

module.exports = mongoose.model('Leave', leaveSchema);
