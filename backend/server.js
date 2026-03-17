require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route imports ──
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');

// ── Initialize Express ──
const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OpsMind AI Backend is running 🚀',
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// ── 404 handler ──
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ── Global error handler (must be last) ──
app.use(errorHandler);

// ── Start server ──
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 OpsMind AI Backend running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔑 Auth API:     http://localhost:${PORT}/api/auth`);
        console.log(`📋 Leave API:    http://localhost:${PORT}/api/leave`);
        console.log(`👑 Admin API:    http://localhost:${PORT}/api/admin`);
        console.log(`🤖 Chat API:     http://localhost:${PORT}/api/chat`);
        console.log(`📄 Docs API:     http://localhost:${PORT}/api/documents\n`);
    });
});

module.exports = app;
