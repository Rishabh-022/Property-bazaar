const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews (one per user per property)
reviewSchema.index({ property: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function(propertyId) {
    const stats = await this.aggregate([
        { $match: { property: propertyId } },
        { $group: { _id: '$property', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    try {
        const Property = mongoose.model('Property');
        if (stats.length > 0) {
            await Property.findByIdAndUpdate(propertyId, {
                averageRating: Math.round(stats[0].avgRating * 10) / 10,
                numReviews: stats[0].numReviews
            });
        } else {
            await Property.findByIdAndUpdate(propertyId, {
                averageRating: 0,
                numReviews: 0
            });
        }
    } catch (err) {
        console.error('Error updating property ratings:', err);
    }
};

// After saving a review, recalculate average
reviewSchema.post('save', function() {
    this.constructor.calcAverageRating(this.property);
});

// After deleting a review, recalculate average
reviewSchema.post('remove', function() {
    this.constructor.calcAverageRating(this.property);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;