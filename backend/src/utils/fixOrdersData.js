const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Order = require('../models/Order');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const fixOrders = async () => {
    try {
        await connectDB();
        console.log('--- Bắt đầu sửa dữ liệu Đơn hàng ---');
        const orders = await Order.find({});
        console.log(`Tìm thấy ${orders.length} đơn hàng.`);

        for (const order of orders) {
            let detailChanged = false;
            for (const item of order.items) {
                // Nếu productName hoặc productImage chưa có (do trước đó lưu nhầm name/image)
                // Ưu tiên 1: Lấy từ Product DB hiện tại
                const product = await Product.findById(item.product);
                if (product) {
                    item.productName = product.name;
                    item.productImage = product.mainImageUrl;
                    detailChanged = true;
                    console.log(`- Đã cập nhật xong snapshot cho ${product.name} trong đơn ${order.orderCode}`);
                } else {
                    // Ưu tiên 2: Nếu DB không có (đã xóa vĩnh viễn), thử lấy từ trường cũ 'name'/'image' nếu MongoDB còn lưu
                    // Mongoose có thể che giấu các trường không có trong schema, nên dùng get() hoặc toObject()
                    const rawItem = item.toObject ? item.toObject() : item;
                    const oldName = rawItem.name || rawItem.productName;
                    const oldImage = rawItem.image || rawItem.productImage;
                    
                    if (oldName) {
                        item.productName = oldName;
                        item.productImage = oldImage;
                        detailChanged = true;
                        console.log(`- Đã khôi phục snapshot từ dữ liệu cũ (${oldName}) cho đơn ${order.orderCode}`);
                    }
                }
            }
            if (detailChanged) {
                await order.save();
            }
        }
        console.log('--- Hoàn tất sửa dữ liệu ---');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi khi sửa dữ liệu:', error);
        process.exit(1);
    }
};

fixOrders();
