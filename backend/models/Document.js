const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        mimeType: {
            type: String,
            default: 'application/pdf',
        },
        size: {
            type: Number, // bytes
            required: true,
        },
        extractedText: {
            type: String,
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['processing', 'indexed', 'error'],
            default: 'indexed',
        },
    },
    { timestamps: true }
);

// Index on name for fast searching
documentSchema.index({ name: 'text', extractedText: 'text' });

module.exports = mongoose.model('Document', documentSchema);
