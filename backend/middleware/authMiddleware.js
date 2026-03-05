const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * authMiddleware
 * Verifies the JWT from the Authorization header.
 * Attaches the full user object to req.user.
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Extract token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Access denied. No token provided.', 401);
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch user (exclude password)
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new AppError('User belonging to this token no longer exists.', 401);
        }

        // 4. Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        }
        const status = error.statusCode || 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

module.exports = authMiddleware;
