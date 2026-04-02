const express = require('express');
const router = express.Router();
const { getCategories, getCategoryTree, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);
router.post('/', protect, admin, upload.single('image'), createCategory);
router.put('/:id', protect, admin, upload.single('image'), updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
