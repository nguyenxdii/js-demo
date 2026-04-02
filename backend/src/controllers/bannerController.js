const Banner = require('../models/Banner');

const getBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({}).sort({ position: 1 });
        res.json(banners);
    } catch (error) {
        next(error);
    }
};

const getActiveBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({ active: true }).sort({ position: 1 });
        res.json(banners);
    } catch (error) {
        next(error);
    }
};

const createBanner = async (req, res, next) => {
    try {
        const { name, link, displayOrder } = req.body;
        // Map frontend fields (name, link, displayOrder) to backend model fields (title, linkUrl, position)
        const title = name;
        const linkUrl = link;
        const position = displayOrder || 0;
        
        let imageUrl = '';
        if (req.file) {
            imageUrl = req.file.path.replace(/\\/g, '/');
        }

        const banner = await Banner.create({ title, imageUrl, linkUrl, position });
        res.status(201).json(banner);
    } catch (error) {
        next(error);
    }
};

const updateBanner = async (req, res, next) => {
    try {
        const { name, link, displayOrder, isActive } = req.body;
        
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            banner.title = name !== undefined ? name : banner.title;
            
            if (req.file) {
                banner.imageUrl = req.file.path.replace(/\\/g, '/');
            }
            
            banner.linkUrl = link !== undefined ? link : banner.linkUrl;
            banner.position = displayOrder !== undefined ? displayOrder : banner.position;
            banner.active = isActive !== undefined ? (isActive === 'true' || isActive === true) : banner.active;
            
            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            res.status(404);
            throw new Error('Banner không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            await banner.deleteOne();
            res.json({ message: 'Đã xóa banner' });
        } else {
            res.status(404);
            throw new Error('Banner không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBanners,
    getActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
