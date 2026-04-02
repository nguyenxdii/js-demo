const cron = require('node-cron');
const Voucher = require('../models/Voucher');

const startSaleExpiryJob = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running Sale Expiry Job...');
        try {
            const now = new Date();
            const result = await Voucher.updateMany(
                { endDate: { $lt: now }, active: true },
                { $set: { active: false } }
            );
            console.log(`Updated ${result.modifiedCount} expired vouchers.`);
        } catch (error) {
            console.error('Error in Sale Expiry Job:', error);
        }
    });
};

module.exports = startSaleExpiryJob;
