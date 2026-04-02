const express = require('express');
const router = express.Router();
const {
    getVouchers,
    getVoucherByCode,
    checkVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
} = require('../controllers/voucherController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getVouchers);
router.get('/check/:code', checkVoucher);
router.get('/code/:code', getVoucherByCode);
router.post('/', protect, admin, createVoucher);
router.put('/:id', protect, admin, updateVoucher);
router.delete('/:id', protect, admin, deleteVoucher);

module.exports = router;
