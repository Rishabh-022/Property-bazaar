const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Create a review
// @route   POST /api/properties/:propertyId/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const propertyId = req.params.propertyId;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Check if user already reviewed this property
        const existingReview = await Review.findOne({
            property: propertyId,
            user: req.user._id
        });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
        }

        const review = await Review.create({
            property: propertyId,
            user: req.user._id,
            rating,
            comment
        });

        await review.populate('user', 'fullName');

        res.status(201).json({ success: true, review });
    } catch (error) {
        console.error('Create Review Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
        }
        res.status(500).json({ success: false, message: 'Error creating review' });
    }
};

// @desc    Get reviews for a property
// @route   GET /api/properties/:propertyId/reviews
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ property: req.params.propertyId })
            .populate('user', 'fullName')
            .sort('-createdAt');

        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (only review owner or admin)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.remove();
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ success: false, message: 'Error deleting review' });
    }
};

module.exports = { createReview, getReviews, deleteReview };