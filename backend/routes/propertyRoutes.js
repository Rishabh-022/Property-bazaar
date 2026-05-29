const express = require('express');
const router = express.Router();
const reviewRouter = require('./reviewRoutes');
const {
    createProperty,
    getProperties,
    getPropertyById,
    getMyProperties,
    updateProperty,
    deleteProperty,
    uploadPropertyImages
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// IMPORTANT: Specific routes MUST come before dynamic routes!
// ==========================================

// Public routes
router.get('/', getProperties);

// Protected routes - SPECIFIC routes first
router.get('/my-listings', protect, getMyProperties);  // ← THIS MUST BE BEFORE /:id

// Protected routes with file upload
router.post('/', protect, upload.array('images', 10), createProperty);
router.post('/:id/images', protect, upload.array('images', 5), uploadPropertyImages);

router.use('/:propertyId/reviews', reviewRouter);

// Dynamic routes - MUST be LAST
router.get('/:id', getPropertyById);      // ← THIS MUST BE AFTER all specific routes
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;