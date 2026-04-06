const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Voucher = require('../models/Voucher');

const getDashboardStats = async (req, res, next) => {
    try {
        const notifPage = parseInt(req.query.notifPage) || 1;
        const range = req.query.range || '30days';
        const notifLimit = 10;
        const skip = (notifPage - 1) * notifLimit;

        const now = new Date();
        let startDate = new Date(0);

        if (range === '7days') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (range === '30days') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (range === '90days') {
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        } else if (range === '365days') {
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }

        const filteredMatch = {
            createdAt: { $gte: startDate },
            $or: [{ paymentStatus: 'PAID' }, { status: 'DELIVERED' }]
        };

        const revenueStats = await Order.aggregate([
            { $match: filteredMatch },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;
        
        const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        // 2. LOGIC BIỂU ĐỒ LINH HOẠT (Daily vs Monthly)
        let revenueChart = [];
        if (range === '7days' || range === '30days') {
            // Hiển thị theo NGÀY
            const daysCount = range === '7days' ? 7 : 30;
            const startOfDays = new Date(now);
            startOfDays.setDate(startOfDays.getDate() - (daysCount - 1));
            startOfDays.setHours(0, 0, 0, 0);

            const dailyStats = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfDays },
                        $or: [{ paymentStatus: 'PAID' }, { status: 'DELIVERED' }]
                    }
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        revenue: { $sum: "$totalAmount" }
                    }
                }
            ]);

            for (let i = 0; i < daysCount; i++) {
                let d = new Date(startOfDays);
                d.setDate(d.getDate() + i);
                const found = dailyStats.find(s => s._id.day === d.getDate() && s._id.month === (d.getMonth() + 1));
                revenueChart.push({
                    name: `${d.getDate()}/${d.getMonth() + 1}`,
                    revenue: found ? found.revenue : 0
                });
            }
        } else {
            // Hiển thị theo THÁNG (Cho mốc 90 ngày, YEAR hoặc ALL)
            const monthsCount = range === '90days' ? 3 : (range === '365days' ? 12 : 6);
            const startOfMonths = new Date(now);
            startOfMonths.setMonth(startOfMonths.getMonth() - (monthsCount - 1));
            startOfMonths.setDate(1);
            startOfMonths.setHours(0, 0, 0, 0);

            const monthlyStats = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfMonths },
                        $or: [{ paymentStatus: 'PAID' }, { status: 'DELIVERED' }]
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);

            const monthNames = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
            for (let i = 0; i < monthsCount; i++) {
                let d = new Date(startOfMonths);
                d.setMonth(d.getMonth() + i);
                const m = d.getMonth() + 1;
                const y = d.getFullYear();
                const found = monthlyStats.find(s => s._id.month === m && s._id.year === y);
                revenueChart.push({
                    name: monthNames[m - 1],
                    revenue: found ? found.revenue : 0
                });
            }
        }

        // 3. Toàn bộ sản phẩm bán ra (CÓ áp dụng lọc thời gian và trạng thái)
        const soldProductsStats = await Order.aggregate([
            { $match: filteredMatch },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.productName" },
                    sales: { $sum: "$items.quantity" }
                }
            },
            { $sort: { sales: -1 } }
        ]);

        const allSoldProducts = soldProductsStats.map(p => ({
            name: p.name || 'Sản phẩm ẩn danh',
            sales: p.sales
        }));

        // Top 5 cho biểu đồ
        const topProducts = allSoldProducts.slice(0, 5);

        // 4. Lấy thông báo hệ thống (Phân trang)
        const totalNotifications = await Notification.countDocuments();
        const dbNotifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(notifLimit);

        let notifications = dbNotifications.map(n => ({
            type: n.type,
            message: n.message,
            link: n.link,
            createdAt: n.createdAt
        }));

        res.json({
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts,
            monthlyRevenue: revenueChart,
            topProducts,
            allSoldProducts,
            notifications,
            totalNotifications
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
