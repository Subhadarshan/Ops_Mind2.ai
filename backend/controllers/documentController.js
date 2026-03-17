const multer = require('multer');
// pdf-parse v2: class-based API
const { PDFParse, VerbosityLevel } = require('pdf-parse');
const Document = require('../models/Document');
const AppError = require('../utils/AppError');

// ── Multer config: store in memory so we can extract text directly ──
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/pdf' ||
            file.originalname.toLowerCase().endsWith('.pdf')
        ) {
            cb(null, true);
        } else {
            cb(new AppError('Only PDF files are supported.', 400), false);
        }
    },
});

/**
 * POST /api/documents/upload
 * Multer middleware first, then this handler.
 * Role: admin or hr
 */
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded. Please attach a PDF.', 400);
        }

        // Extract text from PDF buffer using pdf-parse v2 class API
        let extractedText = '';
        let parser;
        try {
            parser = new PDFParse({
                data: req.file.buffer,
                verbosity: VerbosityLevel.ERRORS,
            });
            const pdfResult = await parser.getText();
            extractedText = pdfResult?.text?.trim() || '';
        } catch (parseErr) {
            console.error('PDF parse error:', parseErr.message);
            throw new AppError(
                'Could not read the PDF. Make sure it is a valid, text-based PDF (not a scanned image).',
                422
            );
        } finally {
            if (parser) await parser.destroy().catch(() => { });
        }

        if (!extractedText || extractedText.length < 10) {
            throw new AppError(
                'The PDF appears to be empty or contains only images (no text). Please upload a text-based PDF.',
                422
            );
        }

        // Save to DB
        const doc = await Document.create({
            name: req.file.originalname,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            extractedText,
            uploadedBy: req.user._id,
            status: 'indexed',
        });

        res.status(201).json({
            success: true,
            message: `"${doc.name}" uploaded and indexed successfully.`,
            data: {
                _id: doc._id,
                name: doc.name,
                size: doc.size,
                status: doc.status,
                createdAt: doc.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/documents/count
 * Returns number of indexed documents (all authenticated users)
 */
const getDocumentCount = async (req, res, next) => {
    try {
        const count = await Document.countDocuments({ status: 'indexed' });
        res.status(200).json({ success: true, count });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/documents
 * Returns list of all documents (name, size, status, date)
 * Role: admin or hr (employees just benefit from context)
 */
const getDocuments = async (req, res, next) => {
    try {
        const docs = await Document.find()
            .select('name size status createdAt uploadedBy')
            .populate('uploadedBy', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: docs,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/documents/:id
 * Role: admin or hr
 */
const deleteDocument = async (req, res, next) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) {
            throw new AppError('Document not found.', 404);
        }

        res.status(200).json({
            success: true,
            message: `"${doc.name}" deleted successfully.`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/documents/search?q=query
 * Lightweight search used internally (and for testing)
 */
const searchDocuments = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, message: 'Query param `q` is required.' });
        }

        // Simple regex search across all docs
        const docs = await Document.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { extractedText: { $regex: q, $options: 'i' } },
            ],
        }).select('name extractedText status createdAt');

        res.status(200).json({
            success: true,
            count: docs.length,
            data: docs.map(d => ({
                name: d.name,
                status: d.status,
                date: d.createdAt,
                preview: d.extractedText.substring(0, 300),
            })),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    upload,
    uploadDocument,
    getDocuments,
    getDocumentCount,
    deleteDocument,
    searchDocuments,
};
