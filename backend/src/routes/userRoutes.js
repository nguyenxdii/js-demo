const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateProfile, updateAvatar, toggleLock, requestPasswordOtp, confirmPasswordChange } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.get('/', protect, admin, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id/profile', protect, updateProfile);
router.put('/:id/toggle-lock', protect, admin, toggleLock);
router.post('/:id/avatar', protect, upload.single('image'), updateAvatar);
router.post('/:id/request-password-otp', protect, requestPasswordOtp);
router.post('/:id/confirm-password-change', protect, confirmPasswordChange);

module.exports = router;
