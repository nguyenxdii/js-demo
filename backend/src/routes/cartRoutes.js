const express = require('express');
const router = express.Router();
const {
    getCartByUserId,
    addToCart,
    updateCartItem,
    removeCartItem,
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

// Hỗ trợ cả /api/cart (GET/POST) có xác thực
router.route('/')
    .get(protect, (req, res, next) => {
        req.params.userId = req.user._id;
        return getCartByUserId(req, res, next);
    })
    .post(protect, addToCart);

// Các endpoint cũ (giữ lại để tương thích)
router.get('/user/:userId', getCartByUserId);
router.post('/add', protect, addToCart);
router.put('/item/:itemId', protect, updateCartItem);
router.delete('/item/:itemId', protect, removeCartItem);

module.exports = router;
