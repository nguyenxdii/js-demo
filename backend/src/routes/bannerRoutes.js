const express = require('express');
const router = express.Router();
const {
    getBanners,
    getActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} = require('../controllers/bannerController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.get('/', getBanners);
router.get('/active', getActiveBanners);
router.post('/', protect, admin, upload.single('file'), createBanner);
router.put('/:id', protect, admin, upload.single('file'), updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
