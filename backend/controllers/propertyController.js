const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private
const createProperty = async (req, res) => {
    try {
        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified. Please verify your email to list properties.'
            });
        }

        const {
            sellerName, sellerPhone, aadhaarNumber, panNumber,
            propertyType, propertySubType, registrationNumber,
            khataNumber, khasraNumber, surveyNumber, reraId,
            ownershipType, title, description, area, areaUnit,
            street, landmark, locality, city, district, state, pincode,
            expectedPrice, priceNegotiable,
            // ---- NEW FIELDS ----
            bedrooms, bathrooms, furnishing, possessionStatus
        } = req.body;

        if (!sellerName || !aadhaarNumber || !registrationNumber || !khataNumber || 
            !propertyType || !title || !description || !area || !street || 
            !locality || !city || !state || !pincode || !expectedPrice) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }

        const images = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'property-bazzar/properties',
                    width: 1200,
                    height: 800,
                    crop: 'fill',
                    quality: 'auto'
                });
                images.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                    isPrimary: i === 0
                });
                fs.unlinkSync(file.path);
            }
        }

        const property = await Property.create({
            owner: req.user._id,
            sellerName,
            sellerPhone: sellerPhone || req.user.phone,
            aadhaarNumber,
            panNumber,
            propertyType,
            propertySubType,
            registrationNumber,
            khataNumber,
            khasraNumber,
            surveyNumber,
            reraId,
            ownershipType,
            title,
            description,
            dimensions: {
                area: Number(area),
                areaUnit: areaUnit || 'sqft'
            },
            // ---- NEW FIELDS ----
            bedrooms: bedrooms ? Number(bedrooms) : 0,
            bathrooms: bathrooms ? Number(bathrooms) : 0,
            furnishing: furnishing || undefined,
            possessionStatus: possessionStatus || undefined,
            // ---- END NEW FIELDS ----
            address: {
                street,
                landmark: landmark || '',
                locality,
                city,
                district: district || '',
                state,
                pincode
            },
            pricing: {
                expectedPrice: Number(expectedPrice),
                priceNegotiable: priceNegotiable === 'true' || priceNegotiable === true
            },
            images,
            status: 'Pending',
            statusHistory: [{
                status: 'Pending',
                changedBy: req.user._id,
                changedAt: Date.now(),
                note: 'Property submitted for verification'
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Property listed successfully! Waiting for approval.',
            property
        });

    } catch (error) {
        console.error('Create Property Error:', error);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Property registration number already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error creating property listing' });
    }
};

// @desc    Get all properties (with advanced filters)
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
    try {
        const {
            city, state, propertyType, minPrice, maxPrice, status,
            // ---- NEW QUERY PARAMS ----
            bedrooms, bathrooms, furnishing, possessionStatus,
            sort, page = 1, limit = 10
        } = req.query;

        const query = {};
        if (city) query['address.city'] = new RegExp(city, 'i');
        if (state) query['address.state'] = new RegExp(state, 'i');
        if (propertyType) query.propertyType = propertyType;
        if (status) query.status = status;
        else query.status = 'Active';

        if (minPrice || maxPrice) {
            query['pricing.expectedPrice'] = {};
            if (minPrice) query['pricing.expectedPrice'].$gte = Number(minPrice);
            if (maxPrice) query['pricing.expectedPrice'].$lte = Number(maxPrice);
        }

        // ---- NEW FILTERS ----
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (bathrooms) query.bathrooms = Number(bathrooms);
        if (furnishing) query.furnishing = furnishing;
        if (possessionStatus) query.possessionStatus = possessionStatus;

        let sortOption = {};
        if (sort === 'price_asc') sortOption['pricing.expectedPrice'] = 1;
        else if (sort === 'price_desc') sortOption['pricing.expectedPrice'] = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else if (sort === 'oldest') sortOption.createdAt = 1;
        else if (sort === 'mostViewed') sortOption.views = -1;
        else if (sort === 'highestRated') sortOption.averageRating = -1;
        else sortOption.createdAt = -1;

        const skip = (Number(page) - 1) * Number(limit);

        const properties = await Property.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .populate('owner', 'fullName email phone');

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            count: properties.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            properties
        });
    } catch (error) {
        console.error('Get Properties Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching properties' });
    }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'fullName email phone')
            .populate('statusHistory.changedBy', 'fullName');
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        property.views += 1;
        await property.save({ validateBeforeSave: false });

        res.json({ success: true, property });
    } catch (error) {
        console.error('Get Property Error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        res.status(500).json({ success: false, message: 'Error fetching property' });
    }
};

// @desc    Get logged in user's properties
// @route   GET /api/properties/my-listings
// @access  Private
const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id })
            .sort('-createdAt');
        res.json({ success: true, count: properties.length, properties });
    } catch (error) {
        console.error('Get My Properties Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching your properties' });
    }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only update your own properties' });
        }

        const updateFields = ['title', 'description', 'propertyType', 'propertySubType',
            'registrationNumber', 'khataNumber', 'khasraNumber', 'surveyNumber', 'reraId', 'ownershipType',
            'bedrooms', 'bathrooms', 'furnishing', 'possessionStatus']; // added new fields
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) property[field] = req.body[field];
        });

        if (req.body.street) property.address.street = req.body.street;
        if (req.body.locality) property.address.locality = req.body.locality;
        if (req.body.city) property.address.city = req.body.city;
        if (req.body.state) property.address.state = req.body.state;
        if (req.body.pincode) property.address.pincode = req.body.pincode;

        if (req.body.expectedPrice) property.pricing.expectedPrice = Number(req.body.expectedPrice);
        if (req.body.priceNegotiable !== undefined) property.pricing.priceNegotiable = req.body.priceNegotiable;
        if (req.body.area) property.dimensions.area = Number(req.body.area);
        if (req.body.areaUnit) property.dimensions.areaUnit = req.body.areaUnit;

        const updatedProperty = await property.save();
        res.json({ success: true, message: 'Property updated successfully', property: updatedProperty });
    } catch (error) {
        console.error('Update Property Error:', error);
        res.status(500).json({ success: false, message: 'Error updating property' });
    }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own properties' });
        }

        for (const image of property.images) {
            if (image.publicId) await cloudinary.uploader.destroy(image.publicId);
        }
        await property.deleteOne();

        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete Property Error:', error);
        res.status(500).json({ success: false, message: 'Error deleting property' });
    }
};

// @desc    Upload additional images to property
// @route   POST /api/properties/:id/images
// @access  Private
const uploadPropertyImages = async (req, res) => {
    try {
        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified. Please verify your email to add images.'
            });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add images to your own properties' });
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'property-bazzar/properties',
                    width: 1200,
                    height: 800,
                    crop: 'fill',
                    quality: 'auto'
                });
                property.images.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
                fs.unlinkSync(file.path);
            }
        }

        await property.save();
        res.json({ success: true, message: 'Images added successfully', images: property.images });
    } catch (error) {
        console.error('Upload Images Error:', error);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ success: false, message: 'Error uploading images' });
    }
};

module.exports = {
    createProperty,
    getProperties,
    getPropertyById,
    getMyProperties,
    updateProperty,
    deleteProperty,
    uploadPropertyImages
};