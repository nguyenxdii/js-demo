const express = require('express');
const router = express.Router();
const { getBrands, getBrandById, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', protect, admin, upload.single('logo'), createBrand);
router.put('/:id', protect, admin, upload.single('logo'), updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
