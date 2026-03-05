const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token.
 * Payload contains userId and role for downstream authorization.
 */
const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

module.exports = generateToken;
