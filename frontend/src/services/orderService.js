import api from './api';

export const orderService = {
    createOrder: (orderData) => {
        return api.post('/orders', orderData);
    },
    getUserOrders: () => {
        return api.get('/orders/myorders');
    },
    getOrderById: (orderId) => {
        return api.get(`/orders/${orderId}`);
    },
    checkStatus: (orderCode) => {
        return api.get(`/orders/check-status/${orderCode}`);
    }
};
