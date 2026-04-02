const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    productName: String,
    productImage: String,
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderCode: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: String,
    phoneNumber: String,
    address: String,
    note: String,
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'MOMO'],
        default: 'COD',
    },
    paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PAID', 'REFUNDED', 'FAILED'],
        default: 'UNPAID',
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'SHIPPED', 'COMPLETED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
    },
    items: [orderDetailSchema],
    transId: String, // MoMo Transaction ID
    momoOrderId: String,
    voucherCode: String,
    discountAmount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
