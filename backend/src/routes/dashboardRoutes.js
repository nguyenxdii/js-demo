const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);

module.exports = router;
