require('dotenv').config();
const mongoose = require('mongoose');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Đã kết nối Database để chuyển đổi trạng thái...');
        
        const Order = mongoose.model('Order', new mongoose.Schema({ status: String }));
        
        const res = await Order.updateMany(
            { status: 'COMPLETED' },
            { $set: { status: 'DELIVERED' } }
        );
        
        console.log(`✅ Hoàn tất: Đã chuyển đổi ${res.modifiedCount} đơn hàng sang DELIVERED.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi chuyển đổi:', error);
        process.exit(1);
    }
};

migrate();
