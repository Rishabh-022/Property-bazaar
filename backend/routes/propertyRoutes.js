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

router.get('/', getProperties);

router.get('/my-listings', protect, getMyProperties);  

router.post('/', protect, upload.array('images', 10), createProperty);
router.post('/:id/images', protect, upload.array('images', 5), uploadPropertyImages);

router.use('/:propertyId/reviews', reviewRouter);

router.get('/:id', getPropertyById);      
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;