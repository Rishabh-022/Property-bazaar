const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to get propertyId from parent route
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getReviews)
    .post(protect, createReview);

router.delete('/:id', protect, deleteReview);

module.exports = router;