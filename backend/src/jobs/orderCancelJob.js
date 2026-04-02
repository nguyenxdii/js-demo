const cron = require('node-cron');
const { cancelExpiredOrders } = require('../services/momoService');

const startOrderCancelJob = () => {
    // Chạy mỗi phút để kiểm tra đơn hàng quá hạn thanh toán (5 phút)
    cron.schedule('* * * * *', async () => {
        await cancelExpiredOrders();
    });
};

module.exports = startOrderCancelJob;
