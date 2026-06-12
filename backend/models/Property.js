const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Property owner is required']
    },
    
    sellerName: {
        type: String,
        required: [true, 'Seller name is required'],
        trim: true
    },
    sellerPhone: {
        type: String,
        required: [true, 'Seller phone is required'],
        match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
    },
    aadhaarNumber: {
        type: String,
        required: [true, 'Aadhaar number is required'],
        match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhaar number']
    },
    panNumber: {
        type: String,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'],
        trim: true
    },

    propertyType: {
        type: String,
        enum: {
            values: ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Plot'],
            message: '{VALUE} is not a valid property type'
        },
        required: [true, 'Property type is required']
    },
    propertySubType: {
        type: String,
        enum: ['Apartment', 'Independent House', 'Villa', 'Farm House', 'Office Space', 'Shop', 'Warehouse', 'Agricultural Land', 'Residential Plot', 'Commercial Plot']
    },
    
    registrationNumber: {
        type: String,
        required: [true, 'Property registration number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    khataNumber: {
        type: String,
        required: [true, 'Khata number is required'],
        trim: true
    },
    khasraNumber: {
        type: String,
        trim: true
    },
    surveyNumber: {
        type: String,
        trim: true
    },
    reraId: {
        type: String,
        trim: true
    },
    
    ownershipType: {
        type: String,
        enum: ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney']
    },
    
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Property description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    
    dimensions: {
        area: {
            type: Number,
            required: [true, 'Area is required'],
            min: [0, 'Area cannot be negative']
        },
        areaUnit: {
            type: String,
            enum: ['sqft', 'sqm', 'sqyd', 'acre', 'hectare', 'bigha'],
            default: 'sqft'
        }
    },

    // ------- NEW FIELDS -------
    bedrooms: {
        type: Number,
        min: [0, 'Bedrooms cannot be negative'],
        default: 0
    },
    bathrooms: {
        type: Number,
        min: [0, 'Bathrooms cannot be negative'],
        default: 0
    },
    furnishing: {
        type: String,
        enum: ['Furnished', 'Semi-Furnished', 'Unfurnished']
    },
    possessionStatus: {
        type: String,
        enum: ['Ready to Move', 'Under Construction']
    },
    
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        landmark: String,
        locality: {
            type: String,
            required: [true, 'Locality is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        district: String,
        state: {
            type: String,
            required: [true, 'State is required']
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
        }
    },
    
    pricing: {
        expectedPrice: {
            type: Number,
            required: [true, 'Expected price is required'],
            min: [0, 'Price cannot be negative']
        },
        priceNegotiable: {
            type: Boolean,
            default: false
        }
    },
    
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Active', 'Rejected', 'Sold', 'Expired'],
        default: 'Pending'
    },

    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: String,
    rejectedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    
    views: {
        type: Number,
        default: 0
    },

    // ===== Status History =====
    statusHistory: [{
        status: {
            type: String,
            enum: ['Draft', 'Pending', 'Active', 'Rejected', 'Sold', 'Expired'],
            required: true
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
    
}, {
    timestamps: true
});

propertySchema.index({ 'address.city': 1, 'propertyType': 1 });
propertySchema.index({ 'pricing.expectedPrice': 1 });
propertySchema.index({ status: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;