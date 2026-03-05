const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, role, department } = req.body;

        // 1. Check required fields
        if (!name || !email || !password) {
            throw new AppError('Name, email, and password are required.', 400);
        }

        // 2. Check duplicate email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new AppError('An account with this email already exists.', 409);
        }

        // 3. Create user (password is auto-hashed via pre-save hook)
        const user = await User.create({
            name,
            email,
            password,
            role: (role || 'EMPLOYEE').toUpperCase(),
            department: department || 'General',
        });

        // 4. Generate JWT
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role.toLowerCase(),
                    department: user.department,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            throw new AppError('Email and password are required.', 400);
        }

        // 2. Find user with password field included
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            throw new AppError('Invalid email or password.', 401);
        }

        // 3. Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401);
        }

        // 4. Generate JWT
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role.toLowerCase(),
                    department: user.department,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase(),
                department: user.department,
            },
        });
    } catch (error) {
        next(error);
    }
};
