/**
 * Global error-handling middleware.
 * Must be the LAST app.use() in server.js.
 */
const errorHandler = (err, req, res, next) => {
    console.error('🔥 Error:', err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for '${field}'. This ${field} already exists.`,
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
    }

    // Operational errors thrown via AppError
    if (err.isOperational) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }

    // Unknown / programming errors — include a helpful message
    res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
};

module.exports = errorHandler;
