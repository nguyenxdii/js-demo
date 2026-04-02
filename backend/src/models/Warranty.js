const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'CLAIMED'],
        default: 'ACTIVE',
    }
}, {
    timestamps: true,
});

const Warranty = mongoose.model('Warranty', warrantySchema);
module.exports = Warranty;
