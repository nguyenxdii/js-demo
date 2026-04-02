const express = require('express');
const router = express.Router();
const { getAllAdmin, getCommentsByProduct, createComment, deleteComment } = require('../controllers/commentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/admin', protect, admin, getAllAdmin);
router.get('/product/:productId', getCommentsByProduct);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
