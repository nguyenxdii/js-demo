const Warranty = require('../models/Warranty');

const getMyWarranties = async (req, res, next) => {
    try {
        const warranties = await Warranty.find({ user: req.user._id }).populate('product');
        res.json(warranties);
    } catch (error) {
        next(error);
    }
};

const createWarranty = async (req, res, next) => {
    try {
        const { orderId, productId, userId, months } = req.body;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const warranty = await Warranty.create({
            order: orderId,
            product: productId,
            user: userId,
            startDate,
            endDate,
            status: 'ACTIVE'
        });
        res.status(201).json(warranty);
    } catch (error) {
        next(error);
    }
};

const getAllWarranties = async (req, res, next) => {
    try {
        const warranties = await Warranty.find({}).populate('user', 'fullName').populate('product', 'name');
        res.json(warranties);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyWarranties,
    createWarranty,
    getAllWarranties,
};
