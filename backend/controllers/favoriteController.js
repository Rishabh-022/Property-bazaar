const User = require('../models/User');

const toggleFavorite = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isFavorite = user.savedProperties.includes(propertyId);

        if (isFavorite) {
            // Remove from favorites
            user.savedProperties = user.savedProperties.filter(
                id => id.toString() !== propertyId
            );
        } else {
            // Add to favorites
            user.savedProperties.push(propertyId);
        }

        await user.save();

        res.json({
            success: true,
            isFavorite: !isFavorite,
            message: isFavorite ? 'Property removed from favorites' : 'Property added to favorites'
        });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ success: false, message: 'Error toggling favorite' });
    }
};

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('savedProperties');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            favorites: user.savedProperties
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, message: 'Error fetching favorites' });
    }
};

module.exports = { toggleFavorite, getFavorites };