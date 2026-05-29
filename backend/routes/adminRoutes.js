const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllProperties,
    getPropertyDetails,
    verifyProperty,
    rejectProperty,
    getAdminAnalytics   // <-- imported
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/analytics', getAdminAnalytics);   // <-- NEW ROUTE
router.get('/properties', getAllProperties);
router.get('/properties/:id', getPropertyDetails);
router.put('/properties/:id/verify', verifyProperty);
router.put('/properties/:id/reject', rejectProperty);

module.exports = router;