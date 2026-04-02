const crypto = require('crypto');
const axios = require('axios').default || require('axios');
const Order = require('../models/Order');

const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const queryEndpoint = process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query';
const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/wallet/callback';
const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:8080/api/orders/momo-callback';

const createPayment = async (orderId, amount, customOrderInfo = null) => {
    const orderIdStr = orderId.toString();
    const requestId = orderIdStr + '-' + Date.now();
    // MoMo yêu cầu số tiền tối thiểu là 1000đ
    const finalAmount = Math.max(1000, Math.round(amount));
    const amountStr = finalAmount.toString();
    const orderInfo = customOrderInfo || "Thanh toán đơn hàng " + orderIdStr;
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature = `accessKey=${accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderIdStr}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey)
                            .update(rawSignature)
                            .digest('hex');

    const requestBody = {
        partnerCode: partnerCode,
        partnerName: "Sport Gear Studio",
        storeId: "SPORT_GEAR_STUDIO",
        requestId: requestId,
        amount: amountStr,
        orderId: orderIdStr,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        requestType: requestType,
        extraData: extraData,
        signature: signature,
        lang: "vi"
    };

    try {
        console.log("Momo Request Body (Full):", JSON.stringify(requestBody, null, 2));
        const response = await axios.post(endpoint, requestBody);
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("Momo API Error (Detailed):", JSON.stringify(errorData, null, 2));
        throw new Error('Không thể tạo liên kết thanh toán Momo. Vui lòng thử lại sau.');
    }
};

const verifySignature = (payload) => {
    const {
        partnerCode: pCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
    } = payload;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${pCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto.createHmac('sha256', secretKey)
                                    .update(rawSignature)
                                    .digest('hex');
                                    
    return signature === expectedSignature;
};

const queryPaymentStatus = async (orderId) => {
    const orderIdStr = orderId.toString();
    const requestId = orderIdStr + '-' + Date.now();
    const rawSignature = `accessKey=${accessKey}&orderId=${orderIdStr}&partnerCode=${partnerCode}&requestId=${requestId}`;
    
    const signature = crypto.createHmac('sha256', secretKey)
                            .update(rawSignature)
                            .digest('hex');

    const requestBody = {
        partnerCode: partnerCode,
        requestId: requestId,
        orderId: orderIdStr,
        signature: signature,
        lang: "vi"
    };

    try {
        const response = await axios.post(queryEndpoint, requestBody);
        return response.data;
    } catch (error) {
        console.error("Momo Query Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

const cancelExpiredOrders = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const result = await Order.updateMany(
            {
                status: 'PENDING',
                paymentMethod: 'MOMO',
                createdAt: { $lt: fiveMinutesAgo }
            },
            {
                $set: {
                    status: 'CANCELLED',
                    paymentStatus: 'FAILED',
                    note: 'Hệ thống tự động hủy do hết hạn thanh toán 5 phút'
                }
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`[CRON] Đã tự động hủy ${result.modifiedCount} đơn hàng MoMo quá hạn (5 phút).`);
        }
    } catch (error) {
        console.error('[CRON] Lỗi khi tự động hủy đơn hàng:', error);
    }
};

module.exports = {
    createPayment,
    verifySignature,
    queryPaymentStatus,
    cancelExpiredOrders
};
