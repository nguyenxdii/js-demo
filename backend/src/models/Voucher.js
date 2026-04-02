const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    type: {
        type: String,
        enum: ['PERCENT', 'FIXED'],
        default: 'FIXED'
    },
    isFreeShip: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
