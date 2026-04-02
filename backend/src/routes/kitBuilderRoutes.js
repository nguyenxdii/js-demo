const express = require('express');
const router = express.Router();
const { getMyKits, getPublicKits, createKit, deleteKit } = require('../controllers/kitBuilderController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/public', getPublicKits);
router.get('/my', protect, getMyKits);
router.post('/', protect, createKit);
router.delete('/:id', protect, deleteKit);

module.exports = router;
