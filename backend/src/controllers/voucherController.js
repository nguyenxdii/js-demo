const Voucher = require('../models/Voucher');

const getVouchers = async (req, res, next) => {
    try {
        // Admin xem tất cả, client chỉ xem voucher còn hạn
        const showAll = req.query.all === 'true';
        const filter = showAll ? {} : { active: true, endDate: { $gte: new Date() } };
        const vouchers = await Voucher.find(filter);
        res.json(vouchers);
    } catch (error) {
        next(error);
    }
};

const getVoucherByCode = async (req, res, next) => {
    try {
        const voucher = await Voucher.findOne({
            code: req.params.code.toUpperCase(),
            active: true
        });
        
        if (voucher) {
            res.json(voucher);
        } else {
            res.status(404);
            throw new Error('Mã giảm giá không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const checkVoucher = async (req, res, next) => {
    try {
        const { code } = req.params;
        const { totalAmount } = req.query;
        const now = new Date();

        const voucher = await Voucher.findOne({
            code: code.toUpperCase(),
            active: true,
            $and: [
                {
                    $or: [
                        { startDate: { $lte: now } },
                        { startDate: null },
                        { startDate: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { endDate: { $gte: now } },
                        { endDate: null },
                        { endDate: { $exists: false } }
                    ]
                }
            ]
        });

        if (!voucher) {
            res.status(404);
            throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn');
        }

        if (voucher.quantity <= 0) {
           res.status(400);
           throw new Error('Mã giảm giá đã hết lượt sử dụng');
        }

        if (totalAmount && Number(totalAmount) < voucher.minOrderAmount) {
            res.status(400);
            throw new Error(`Đơn hàng tối thiểu để áp dụng mã là ${voucher.minOrderAmount.toLocaleString()} ₫`);
        }

        let discountAmount = 0;
        if (voucher.isFreeShip) {
             discountAmount = 0; // Logic freeship xử lý ở frontend hoặc tính phí ship = 0
        } else if (voucher.type === 'PERCENT') {
            discountAmount = (Number(totalAmount) * voucher.discountPercentage) / 100;
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
                discountAmount = voucher.maxDiscount;
            }
        } else {
            discountAmount = voucher.discountAmount;
        }

        res.json({
            code: voucher.code,
            discountAmount,
            isFreeShip: voucher.isFreeShip,
            type: voucher.type,
            value: voucher.type === 'PERCENT' ? voucher.discountPercentage : voucher.discountAmount
        });
    } catch (error) {
        next(error);
    }
};

const createVoucher = async (req, res, next) => {
    try {
        const { code, type, value, maxDiscountValue, minOrderValue, startDate, expirationDate, quantity, isFreeShip } = req.body;
        
        let discountAmount = 0;
        let discountPercentage = 0;
        
        if (!isFreeShip) {
            if (type === 'PERCENT') discountPercentage = value;
            if (type === 'FIXED') discountAmount = value;
        }

        const voucher = await Voucher.create({
            code: code.toUpperCase(),
            discountAmount,
            discountPercentage,
            maxDiscount: maxDiscountValue,
            minOrderAmount: minOrderValue,
            startDate,
            endDate: expirationDate,
            quantity,
            isFreeShip: isFreeShip || false,
            type: type || 'FIXED'
        });
        res.status(201).json(voucher);
    } catch (error) {
        next(error);
    }
};

const updateVoucher = async (req, res, next) => {
    try {
        const { code, type, value, maxDiscountValue, minOrderValue, startDate, expirationDate, quantity, isActive, isFreeShip } = req.body;
        const voucher = await Voucher.findById(req.params.id);
        
        if (voucher) {
            let discountAmount = voucher.discountAmount || 0;
            let discountPercentage = voucher.discountPercentage || 0;
            
            if (isFreeShip) {
                discountAmount = 0;
                discountPercentage = 0;
            } else if (value !== undefined) {
                const appliedType = type || voucher.type || 'FIXED';
                if (appliedType === 'PERCENT') { discountPercentage = value; discountAmount = 0; }
                if (appliedType === 'FIXED') { discountAmount = value; discountPercentage = 0; }
            }

            if (code) voucher.code = code.toUpperCase();
            voucher.discountAmount = discountAmount;
            voucher.discountPercentage = discountPercentage;
            if (maxDiscountValue !== undefined) voucher.maxDiscount = maxDiscountValue;
            if (minOrderValue !== undefined) voucher.minOrderAmount = minOrderValue;
            if (startDate) voucher.startDate = startDate;
            if (expirationDate) voucher.endDate = expirationDate;
            if (quantity !== undefined) voucher.quantity = quantity;
            if (isActive !== undefined) voucher.active = isActive;
            voucher.isFreeShip = isFreeShip !== undefined ? isFreeShip : voucher.isFreeShip;
            voucher.type = type || voucher.type || 'FIXED';

            const updatedVoucher = await voucher.save();
            res.json(updatedVoucher);
        } else {
            res.status(404);
            throw new Error('Voucher không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const deleteVoucher = async (req, res, next) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (voucher) {
            await voucher.deleteOne();
            res.json({ message: 'Đã xóa mã giảm giá' });
        } else {
            res.status(404);
            throw new Error('Voucher không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVouchers,
    getVoucherByCode,
    checkVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
};
