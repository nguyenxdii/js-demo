const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../upload')));

// Basic route for health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Sport Gear Studio API',
        system: 'Sport Gear Studio Node.js Backend',
        version: '1.0.0'
    });
});

// Load routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/carts', require('./routes/cartRoutes'));
app.use('/api/cart', require('./routes/cartRoutes')); // Bí danh số ít
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/warranties', require('./routes/warrantyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/sections', require('./routes/sectionRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

app.use('/api/admin/dashboard', require('./routes/dashboardRoutes'));

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
