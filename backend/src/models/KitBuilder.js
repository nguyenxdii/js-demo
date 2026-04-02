const mongoose = require('mongoose');

const kitItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    }
});

const kitBuilderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    items: [kitItemSchema],
    totalPrice: {
        type: Number,
        default: 0,
    },
    isPublic: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const KitBuilder = mongoose.model('KitBuilder', kitBuilderSchema);
module.exports = KitBuilder;
