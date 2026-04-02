require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const startSaleExpiryJob = require('./jobs/saleExpiryJob');
const startOrderCancelJob = require('./jobs/orderCancelJob');

const PORT = process.env.PORT || 8080;

// Connect to Database
connectDB().then(() => {
    // Start Scheduled Jobs
    startSaleExpiryJob();
    startOrderCancelJob();
    
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`Sport Gear Studio Backend (Node.js) is ready`);
    });
});
