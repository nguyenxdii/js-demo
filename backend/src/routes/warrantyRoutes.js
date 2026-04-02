const express = require('express');
const router = express.Router();
const { getMyWarranties, createWarranty, getAllWarranties } = require('../controllers/warrantyController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/my', protect, getMyWarranties);
router.get('/admin/all', protect, admin, getAllWarranties);
router.post('/admin', protect, admin, createWarranty);

module.exports = router;
