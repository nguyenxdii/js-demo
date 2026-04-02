const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Order = require('../models/Order');
const connectDB = require('../config/db');

const inspect = async () => {
    await connectDB();
    const order = await Order.findOne({ orderCode: 'SGS1775133707190' });
    console.log(JSON.stringify(order, null, 2));
    process.exit(0);
};
inspect();
 Riverside, CA
