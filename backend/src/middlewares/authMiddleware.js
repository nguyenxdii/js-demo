const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (error) {
            res.status(401);
            return next(new Error('Mã xác thực không hợp lệ hoặc đã hết hạn'));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Vui lòng đăng nhập để thực hiện tác vụ này'));
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    } else {
        res.status(403);
        return next(new Error('Bạn không có quyền truy cập khu vực này'));
    }
};

const staff = (req, res, next) => {
    if (req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as staff');
    }
};

module.exports = { protect, admin, staff };
