const Brand = require('../models/Brand');
const Product = require('../models/Product');

const getBrands = async (req, res, next) => {
    try {
        const showAll = req.query.all === 'true';
        const filter = showAll ? {} : { active: true };
        const brands = await Brand.find(filter).sort({ name: 1 });
        
        // Map active to isActive for consistency with frontend
        const mappedBrands = brands.map(b => {
             const brandObj = b.toObject();
             return { ...brandObj, isActive: brandObj.active };
        });
        
        res.json(mappedBrands);
    } catch (error) {
        next(error);
    }
};

const getBrandById = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (brand) {
            res.json(brand);
        } else {
            res.status(404);
            throw new Error('Không tìm thấy thương hiệu');
        }
    } catch (error) {
        next(error);
    }
};

const createBrand = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const logoUrl = req.file ? req.file.path : req.body.logoUrl;
        const brand = await Brand.create({ name, description, logoUrl });
        res.status(201).json(brand);
    } catch (error) {
        return next(error);
    }
};

const updateBrand = async (req, res, next) => {
    try {
        const { name, description, logoUrl, active, isActive } = req.body;
        const brand = await Brand.findById(req.params.id);
        if (brand) {
            brand.name = name || brand.name;
            brand.description = description || brand.description;
            if (req.file) {
                brand.logoUrl = req.file.path;
            } else if (logoUrl) {
                brand.logoUrl = logoUrl;
            }
            // Support both `active` and `isActive` field names
            if (active !== undefined) brand.active = (active === 'true' || active === true);
            if (isActive !== undefined) brand.active = (isActive === 'true' || isActive === true);
            const updatedBrand = await brand.save();
            res.json(updatedBrand);
        } else {
            res.status(404);
            throw new Error('Thương hiệu không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const deleteBrand = async (req, res, next) => {
    try {
        // Support both soft delete (toggle active) and hard delete
        const isHardDelete = req.query.hard === 'true';
        const brand = await Brand.findById(req.params.id);
        if (brand) {
            if (isHardDelete) {
                // Kiểm tra xem có sản phẩm thuộc thương hiệu này không
                const productCount = await Product.countDocuments({ brand: req.params.id });
                if (productCount > 0) {
                    res.status(400);
                    throw new Error(`Không thể xóa thương hiệu vì đang có ${productCount} sản phẩm liên kết. Vui lòng chuyển sản phẩm sang thương hiệu khác trước.`);
                }

                await brand.deleteOne();
                res.json({ message: 'Đã xóa thương hiệu thành công' });
            } else {
                // Toggle active status
                brand.active = !brand.active;
                await brand.save();
                res.json({ message: brand.active ? 'Đã hiện thương hiệu' : 'Đã ẩn thương hiệu', brand });
            }
        } else {
            res.status(404);
            throw new Error('Thương hiệu không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
};
