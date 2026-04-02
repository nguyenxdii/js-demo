const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['ORDER', 'PAYMENT', 'STOCK', 'VOUCHER', 'USER'],
        required: true,
    },
    link: {
        type: String, // Đường dẫn để Admin nhấn vào và chuyển trang (ví dụ: /admin/orders)
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // ID của order, product hoặc voucher liên quan
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
