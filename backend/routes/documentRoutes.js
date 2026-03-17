const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    upload,
    uploadDocument,
    getDocuments,
    getDocumentCount,
    deleteDocument,
    searchDocuments,
} = require('../controllers/documentController');

// All routes require authentication
router.use(authMiddleware);

// GET  /api/documents          — list all documents (admin + hr)
// POST /api/documents/upload   — upload a new PDF (admin + hr only)
// GET  /api/documents/search   — search documents
// DELETE /api/documents/:id    — delete a document (admin + hr only)

router.get('/', roleMiddleware('ADMIN', 'HR'), getDocuments);
router.get('/count', getDocumentCount); // all authenticated users
router.post(
    '/upload',
    roleMiddleware('ADMIN', 'HR'),
    upload.single('document'),
    uploadDocument
);
router.get('/search', searchDocuments);
router.delete('/:id', roleMiddleware('ADMIN', 'HR'), deleteDocument);

module.exports = router;
