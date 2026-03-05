const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10s timeout for initial connection
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);

        // Log reconnection events
        mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected. Reconnecting…'));
        mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected.'));
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
