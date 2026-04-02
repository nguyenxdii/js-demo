const KitBuilder = require('../models/KitBuilder');

const getMyKits = async (req, res, next) => {
    try {
        const kits = await KitBuilder.find({ user: req.user._id }).populate('items.product');
        res.json(kits);
    } catch (error) {
        next(error);
    }
};

const getPublicKits = async (req, res, next) => {
    try {
        const kits = await KitBuilder.find({ isPublic: true }).populate('items.product').populate('user', 'fullName');
        res.json(kits);
    } catch (error) {
        next(error);
    }
};

const createKit = async (req, res, next) => {
    try {
        const { name, items, totalPrice, isPublic } = req.body;
        const kit = await KitBuilder.create({
            user: req.user._id,
            name,
            items,
            totalPrice,
            isPublic
        });
        res.status(201).json(kit);
    } catch (error) {
        next(error);
    }
};

const deleteKit = async (req, res, next) => {
    try {
        const kit = await KitBuilder.findById(req.params.id);
        if (kit && (kit.user.toString() === req.user._id.toString() || req.user.role === 'ADMIN')) {
            await kit.deleteOne();
            res.json({ message: 'Đã xóa bộ kit' });
        } else {
            res.status(404);
            throw new Error('Bộ kit không tồn tại hoặc bạn không có quyền xóa');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyKits,
    getPublicKits,
    createKit,
    deleteKit,
};
