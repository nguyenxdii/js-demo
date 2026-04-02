const express = require('express');
const router = express.Router();
const {
    getSections,
    getActiveSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    addProductToSection,
    removeProductFromSection,
} = require('../controllers/sectionController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getSections);
router.get('/active', getActiveSections);
router.post('/', protect, admin, createSection);
router.put('/reorder', protect, admin, reorderSections);
router.put('/:id', protect, admin, updateSection);
router.post('/:id/products/:productId', protect, admin, addProductToSection);
router.delete('/:id/products/:productId', protect, admin, removeProductFromSection);
router.delete('/:id', protect, admin, deleteSection);

module.exports = router;
