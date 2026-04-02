const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getMyOrders,
    momoCallback,
    getAllOrders,
    updateOrderStatus,
    getOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/check-status/:orderCode', protect, getOrderStatus);
router.get('/:id', protect, getOrderById);

// MoMo Callback - NOT protected by Auth (MoMo calls this)
router.post('/momo-callback', momoCallback);

// Admin Routes
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
