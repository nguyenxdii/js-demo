const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { createPayment, verifySignature, queryPaymentStatus } = require('../services/momoService');
const User = require('../models/User');
const Voucher = require('../models/Voucher');

const reduceStock = async (items) => {
    try {
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
    } catch (error) {
        console.error('Error reducing stock:', error);
    }
};

const createOrder = async (req, res, next) => {
    try {
        let { shippingAddress, receiverPhone, note, paymentMethod, voucherCode } = req.body;
        if (voucherCode) voucherCode = voucherCode.trim();
        const userId = req.user._id;

        // 1. Lấy thông tin giỏ hàng
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            res.status(400);
            throw new Error('Đơn hàng không có sản phẩm');
        }

        // 2. Lấy thông tin người dùng nếu thiếu
        const user = await User.findById(userId);
        const fullName = req.body.fullName || user.fullName;
        const email = req.body.email || user.email;
        const phoneNumber = receiverPhone || user.phoneNumber;
        const address = shippingAddress || user.address;

        // 3. Chuẩn bị danh sách sản phẩm cho đơn hàng
        // Áp dụng giảm giá động cho sản phẩm trong giỏ hàng
        const { applySectionDiscounts } = require('../utils/discountHelper');
        const productsWithDiscounts = await applySectionDiscounts(cart.items.map(i => i.product));
        
        const orderItems = cart.items.map((item, index) => {
            const productWithDiscount = productsWithDiscounts[index];
            return {
                product: item.product._id,
                productName: item.product.name,
                quantity: item.quantity,
                price: productWithDiscount.price,
                productImage: item.product.mainImageUrl
            };
        });

        // 4. Tính toán tổng tiền
        const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        let discountAmount = 0;
        let voucherApplied = null;

        if (voucherCode) {
            const now = new Date();
            // Sử dụng logic tìm kiếm linh hoạt giống voucherController.checkVoucher
            const voucher = await Voucher.findOne({
                code: voucherCode.toUpperCase(),
                active: true,
                $and: [
                    {
                        $or: [
                            { startDate: { $lte: now } },
                            { startDate: null },
                            { startDate: { $exists: false } }
                        ]
                    },
                    {
                        $or: [
                            { endDate: { $gte: now } },
                            { endDate: null },
                            { endDate: { $exists: false } }
                        ]
                    }
                ]
            });

            if (voucher && voucher.quantity > 0 && subtotal >= (voucher.minOrderAmount || 0)) {
                if (voucher.isFreeShip) {
                    // Nếu là freeship thì phí ship bằng 0
                    // discountAmount vẫn tính dựa trên type nếu có, hoặc chỉ miễn phí ship
                    // Ở đây giả định isFreeShip chỉ miễn phí vận chuyển
                } else if (voucher.type === 'PERCENT') {
                    discountAmount = (subtotal * voucher.discountPercentage) / 100;
                    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
                        discountAmount = voucher.maxDiscount;
                    }
                } else {
                    discountAmount = voucher.discountAmount;
                }
                voucherApplied = voucher;
                console.log(`[VOUCHER] Áp dụng thành công mã ${voucherCode}, giảm: ${discountAmount}`);
            } else {
                console.log(`[VOUCHER] Mã ${voucherCode} không hợp lệ hoặc không đủ điều kiện.`, {
                    found: !!voucher,
                    quantity: voucher?.quantity,
                    minOrder: voucher?.minOrderAmount,
                    subtotal
                });
            }
        }

        const isFreeShip = voucherApplied?.isFreeShip || (subtotal >= 1000000);
        const shippingFee = isFreeShip ? 0 : 30000;
        const totalAmount = subtotal + shippingFee - discountAmount;

        console.log(`[ORDER] Tạo đơn hàng mới: Tạm tính=${subtotal}, Ship=${shippingFee}, Giảm giá=${discountAmount}, Tổng=${totalAmount}`);
        const orderCode = 'SGS' + Date.now();

        const order = new Order({
            user: userId,
            orderCode,
            fullName,
            email,
            phoneNumber,
            address,
            note,
            totalAmount: totalAmount > 0 ? totalAmount : 0,
            shippingFee,
            discountAmount,
            voucherCode: voucherApplied ? voucherApplied.code : null,
            paymentMethod,
            items: orderItems,
        });

        const createdOrder = await order.save();

        // 5. Tạo thông báo cho Admin khi có đơn hàng mới
        const Notification = require('../models/Notification');
        await Notification.create({
            title: 'Đơn hàng mới',
            message: `Khách hàng ${fullName} đã đặt đơn hàng ${orderCode}`,
            type: 'ORDER',
            link: '/admin/orders',
            relatedId: createdOrder._id
        });

        // 6. Xử lý thanh toán
        if (paymentMethod === 'MOMO') {
            console.log(`Đang tạo thanh toán MoMo cho đơn ${orderCode}, số tiền: ${totalAmount} (giảm giá: ${discountAmount})`);
            const momoData = await createPayment(orderCode, totalAmount, `Thanh toan don hang Sport Gear Studio ${orderCode}`);
            if (momoData && momoData.payUrl) {
                res.status(201).json({ 
                    order: createdOrder, 
                    paymentUrl: momoData.payUrl,
                    orderCode: orderCode
                });
            } else {
                res.status(400);
                throw new Error('Lỗi khởi tạo thanh toán MoMo');
            }
        } else {
            await Cart.findOneAndUpdate({ user: userId }, { items: [] });
            res.status(201).json({ order: createdOrder, orderCode: orderCode });
        }
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'fullName email')
            .populate('items.product', 'name mainImageUrl slug');
        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error('Không tìm thấy đơn hàng');
        }
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const momoCallback = async (req, res, next) => {
    try {
        const payload = req.body;
        console.log('MoMo Callback payload:', payload);

        if (verifySignature(payload)) {
            const { orderId, resultCode, transId } = payload;
            const order = await Order.findOne({ orderCode: orderId });

            if (order) {
                const Notification = require('../models/Notification');
                if (resultCode == 0) {
                    order.paymentStatus = 'PAID';
                    order.status = 'PROCESSING';
                    order.paymentDetails = { ...order.paymentDetails, ...req.body };
                    
                    // Giảm số lượng voucher khi thanh toán thành công
                    if (order.voucherCode) {
                        await Voucher.updateOne(
                            { code: order.voucherCode },
                            { $inc: { quantity: -1 } }
                        );
                    }

                    // Tự động xóa giỏ hàng và trừ kho khi thanh toán thành công
                    await reduceStock(order.items);
                    const cartUserId = order.user?._id || order.user;
                    await Cart.findOneAndUpdate({ user: cartUserId }, { items: [] });

                    // Tạo thông báo cho Admin khi thanh toán thành công
                    await Notification.create({
                        title: 'Thanh toán thành công',
                        message: `Đơn hàng ${orderId} đã được thanh toán thành công qua MoMo (GD: ${transId})`,
                        type: 'PAYMENT',
                        link: '/admin/payments',
                        relatedId: order._id
                    });
                } else {
                    // Tất cả các mã lỗi khác (bao gồm 1006 - Hủy, 9000 - Hết hạn...) đều thành CANCELLED
                    console.log(`[MOMO] Thanh toán thất bại cho đơn ${orderId}, resultCode: ${resultCode}`);
                    order.status = 'CANCELLED';
                    order.paymentStatus = 'FAILED';
                    order.paymentDetails = { ...order.paymentDetails, ...req.body };
                }
                await order.save();
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } else {
            console.error('MoMo signature verification failed');
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'fullName email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status || order.status;
            order.paymentStatus = paymentStatus || order.paymentStatus;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Đơn hàng không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const getOrderStatus = async (req, res, next) => {
    try {
        const { orderCode } = req.params;
        let order = await Order.findOne({ orderCode });
        
        if (!order) {
            res.status(404);
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Nếu đơn hàng đang chờ thanh toán qua MoMo, thử query thực tế
        if (order.status === 'PENDING' && order.paymentMethod === 'MOMO') {
            const momoResult = await queryPaymentStatus(orderCode);
            console.log(`MoMo Query Result for ${orderCode}:`, momoResult);
            
            if (momoResult) {
                if (momoResult.resultCode === 0) {
                    // Kiểm tra lại lần nữa để tránh race condition với callback
                    const freshOrder = await Order.findOne({ orderCode });
                    if (freshOrder.status === 'PENDING') {
                        freshOrder.status = 'PROCESSING';
                        freshOrder.paymentStatus = 'PAID';
                        freshOrder.transId = momoResult.transId || freshOrder.transId;
                        
                        // Trừ kho + voucher (chỉ 1 lần vì callback chưa xử lý)
                        await reduceStock(freshOrder.items);
                        
                        if (freshOrder.voucherCode) {
                            await Voucher.updateOne({ code: freshOrder.voucherCode }, { $inc: { quantity: -1 } });
                        }

                        const cartUserId = freshOrder.user?._id || freshOrder.user;
                        await Cart.findOneAndUpdate({ user: cartUserId }, { items: [] });
                        
                        order = await freshOrder.save();
                        
                        const Notification = require('../models/Notification');
                        await Notification.create({
                            title: 'Thanh toán thành công (Query)',
                            message: `Đơn hàng ${orderCode} đã được xác nhận thanh toán thành công.`,
                            type: 'PAYMENT',
                            link: '/admin/orders',
                            relatedId: order._id
                        });
                    } else {
                        // Callback đã xử lý rồi, chỉ cần trả về order mới nhất
                        order = freshOrder;
                    }
                } else if (momoResult.resultCode !== 1000 && momoResult.resultCode !== 1001 && momoResult.resultCode !== 1005) {
                    // Chỉ hủy nếu order vẫn PENDING
                    const freshOrder = await Order.findOne({ orderCode });
                    if (freshOrder.status === 'PENDING') {
                        freshOrder.status = 'CANCELLED';
                        freshOrder.paymentStatus = 'FAILED';
                        await freshOrder.save();
                        order = freshOrder;
                    }
                }
            }
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    getOrderStatus,
    momoCallback,
    getAllOrders,
    updateOrderStatus,
};
