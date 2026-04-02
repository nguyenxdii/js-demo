const Category = require('../models/Category');
const Product = require('../models/Product');

const getCategories = async (req, res, next) => {
    try {
        const showAll = req.query.all === 'true';
        const filter = showAll ? {} : { active: true }; // Thêm filter bị thiếu
        const categories = await Category.find(filter)
            .populate('parent')
            .populate('brands')
            .sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

const getCategoryTree = async (req, res, next) => {
    try {
        const categories = await Category.find({ active: true }).lean();
        
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => String(cat.parent || null) === String(parentId))
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat._id)
                }));
        };

        const tree = buildTree();
        res.json(tree);
    } catch (error) {
        return next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parent')
            .populate('brands');
        if (category) {
            res.json(category);
        } else {
            res.status(404);
            return next(new Error('Không tìm thấy danh mục'));
        }
    } catch (error) {
        return next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, description, parentId, isActive, slug, brandIds } = req.body;
        const imageUrl = req.file ? req.file.path : req.body.imageUrl;
        
        const parent = parentId || null;
        const active = isActive !== undefined ? (isActive === 'true' || isActive === true) : true;
        const brands = brandIds || [];
        
        const category = await Category.create({ name, description, imageUrl, parent, active, slug, brands });
        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            return next(new Error(`Slug "${req.body.slug}" đã tồn tại, vui lòng chọn tên khác.`));
        }
        return next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { name, description, imageUrl, isActive, parentId, slug, brandIds } = req.body;
        const category = await Category.findById(req.params.id);
        if (category) {
            category.name = name || category.name;
            category.description = description || category.description;
            if (slug !== undefined) category.slug = slug;
            if (parentId !== undefined) category.parent = parentId || null;
            if (brandIds !== undefined) category.brands = Array.isArray(brandIds) ? brandIds : [brandIds];
            
            if (req.file) {
                category.imageUrl = req.file.path;
            } else if (imageUrl) {
                category.imageUrl = imageUrl;
            }
            category.active = isActive !== undefined ? (isActive === 'true' || isActive === true) : category.active;
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404);
            return next(new Error('Danh mục không tồn tại'));
        }
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            return next(new Error(`Slug "${req.body.slug}" đã tồn tại, vui lòng chọn tên khác.`));
        }
        return next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const isHardDelete = req.query.hard === 'true';
        const category = await Category.findById(req.params.id);
        if (category) {
            if (isHardDelete) {
                // Kiểm tra ràng buộc: có sản phẩm không?
                const productCount = await Product.countDocuments({ category: req.params.id });
                if (productCount > 0) {
                    res.status(400);
                    throw new Error(`Không thể xóa danh mục này vì đang có ${productCount} sản phẩm phụ thuộc. Vui lòng xóa sản phẩm trước hoặc ẩn danh mục.`);
                }

                // Kiểm tra ràng buộc: có danh mục con không?
                const subCategoryCount = await Category.countDocuments({ parent: req.params.id });
                if (subCategoryCount > 0) {
                    res.status(400);
                    throw new Error(`Không thể xóa danh mục này vì đang có ${subCategoryCount} danh mục con phụ thuộc.`);
                }

                await category.deleteOne();
                res.json({ message: 'Đã xóa danh mục thành công' });
            } else {
                // Toggle active status
                category.active = !category.active;
                await category.save();
                res.json({ message: category.active ? 'Đã hiện danh mục' : 'Đã ẩn danh mục', category });
            }
        } else {
            res.status(404);
            throw new Error('Danh mục không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryTree,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
