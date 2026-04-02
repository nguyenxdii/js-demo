const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.array('files', 10), createProduct);
router.put('/:id', protect, admin, upload.array('files', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
