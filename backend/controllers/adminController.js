const Property = require('../models/Property');
const User = require('../models/User');
const moment = require('moment'); // <-- make sure moment is installed
const generatePropertyReport = require('../utils/generatePropertyReport');
const cloudinary = require('../config/cloudinary');
const transporter = require('../config/email');
const { propertyApprovedEmail, propertyRejectedEmail } = require('../utils/emailTemplates');

const getDashboardStats = async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments();
        const pendingProperties = await Property.countDocuments({ status: 'Pending' });
        const activeProperties = await Property.countDocuments({ status: 'Active' });
        const rejectedProperties = await Property.countDocuments({ status: 'Rejected' });
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        const recentProperties = await Property.find()
            .sort('-createdAt')
            .limit(5)
            .populate('owner', 'fullName');

        res.json({
            success: true,
            stats: {
                totalProperties,
                pendingProperties,
                activeProperties,
                rejectedProperties,
                totalUsers
            },
            recentProperties
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
};

const getAllProperties = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) {
            query.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const properties = await Property.find(query)
            .populate('owner', 'fullName email phone')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            properties
        });
    } catch (error) {
        console.error('Admin Get Properties Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching properties'
        });
    }
};

const getPropertyDetails = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'fullName email phone aadhaarNumber')
            .populate('statusHistory.changedBy', 'fullName');   // NEW: populate the admin name

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            property
        });
    } catch (error) {
        console.error('Get Property Details Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property details'
        });
    }
};

const verifyProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'fullName email');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        if (property.status === 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Property is already verified'
            });
        }

        property.status = 'Active';
        property.verifiedAt = Date.now();
        property.verifiedBy = req.user._id;

        // ---- NEW: record in statusHistory ----
        property.statusHistory.push({
            status: 'Active',
            changedBy: req.user._id,
            changedAt: Date.now(),
            note: 'Approved by admin'
        });

        await property.save();

        let pdfBuffer;
        try {
            pdfBuffer = await generatePropertyReport(property);
        } catch (pdfErr) {
            console.error('Failed to generate PDF:', pdfErr);
        }

        if (property.owner && property.owner.email) {
            try {
                const mailOptions = {
                    from: `"PropertyBazzar" <${process.env.EMAIL_USER}>`,
                    to: property.owner.email,
                    subject: '🎉 Your Property Has Been Approved!',
                    html: propertyApprovedEmail(
                        property.owner.fullName,
                        property.title,
                        property._id
                    ),
                };

                if (pdfBuffer) {
                    mailOptions.attachments = [
                        {
                            filename: `Property-Report-${property.registrationNumber}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ];
                }

                await transporter.sendMail(mailOptions);
                console.log('✅ Approval email sent to:', property.owner.email, pdfBuffer ? '(with PDF)' : '');
            } catch (emailErr) {
                console.error('Failed to send approval email:', emailErr.message);
            }
        }

        res.json({
            success: true,
            message: 'Property verified and approved successfully',
            property
        });
    } catch (error) {
        console.error('Verify Property Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying property'
        });
    }
};

const rejectProperty = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const property = await Property.findById(req.params.id).populate('owner', 'fullName email');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        property.status = 'Rejected';
        property.rejectionReason = reason || 'Does not meet verification criteria';
        property.rejectedAt = Date.now();
        property.rejectedBy = req.user._id;

        // ---- NEW: record in statusHistory ----
        property.statusHistory.push({
            status: 'Rejected',
            changedBy: req.user._id,
            changedAt: Date.now(),
            note: reason || 'Does not meet verification criteria'
        });

        await property.save();

        if (property.owner && property.owner.email) {
            try {
                await transporter.sendMail({
                    from: `"PropertyBazzar" <${process.env.EMAIL_USER}>`,
                    to: property.owner.email,
                    subject: '⚠️ Your Property Needs Revision',
                    html: propertyRejectedEmail(
                        property.owner.fullName,
                        property.title,
                        reason
                    )
                });
                console.log('✅ Rejection email sent to:', property.owner.email);
            } catch (emailErr) {
                console.error('Failed to send rejection email:', emailErr.message);
            }
        }

        res.json({
            success: true,
            message: 'Property has been rejected',
            property
        });
    } catch (error) {
        console.error('Reject Property Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting property'
        });
    }
};

const getAdminAnalytics = async (req, res) => {
    try {
        const statusCounts = await Property.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const statusData = {};
        statusCounts.forEach(item => { statusData[item._id] = item.count; });

        const typeCounts = await Property.aggregate([
            { $group: { _id: '$propertyType', count: { $sum: 1 } } }
        ]);

        const sixMonthsAgo = moment().subtract(6, 'months').startOf('month').toDate();
        const monthlyListings = await Property.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const topCities = await Property.aggregate([
            { $group: { _id: '$address.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const priceRanges = [
            { label: 'Under ₹25L', min: 0, max: 2500000 },
            { label: '₹25L - ₹50L', min: 2500000, max: 5000000 },
            { label: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
            { label: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
            { label: 'Above ₹2Cr', min: 20000000, max: Infinity }
        ];
        const priceDistribution = await Promise.all(
            priceRanges.map(async range => {
                const count = await Property.countDocuments({
                    'pricing.expectedPrice': { $gte: range.min, $lt: range.max === Infinity ? 99999999999 : range.max }
                });
                return { range: range.label, count };
            })
        );

        const avgStats = await Property.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$pricing.expectedPrice' },
                    avgArea: { $avg: '$dimensions.area' }
                }
            }
        ]);
        const avgPrice = avgStats[0]?.avgPrice || 0;
        const avgArea = avgStats[0]?.avgArea || 0;

        const recentActivity = await Property.find({ status: { $in: ['Active', 'Rejected'] } })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('verifiedBy', 'fullName')
            .populate('rejectedBy', 'fullName')
            .select('title status verifiedAt rejectedAt rejectionReason verifiedBy rejectedBy');

        res.json({
            success: true,
            data: {
                statusData,
                typeCounts,
                monthlyListings,
                topCities,
                priceDistribution,
                avgPrice,
                avgArea,
                recentActivity,
                totalProperties: await Property.countDocuments(),
                totalUsers: await User.countDocuments({ role: 'user' })
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
};

module.exports = {
    getDashboardStats,
    getAllProperties,
    getPropertyDetails,
    verifyProperty,
    rejectProperty,
    getAdminAnalytics  
};