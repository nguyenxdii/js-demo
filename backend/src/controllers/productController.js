const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Section = require('../models/Section');

const getProducts = async (req, res, next) => {
    try {
        const isAdmin = req.user && req.user.role === 'ADMIN';
        const limitParam = req.query.limit;
        
        let pageSize = 12;
        if (limitParam === 'all' || (isAdmin && !req.query.pageNumber)) {
            pageSize = 1000; // Cho phép lấy tối đa 1000 sản phẩm cho Admin/danh sách đầy đủ
        } else if (limitParam) {
            pageSize = Number(limitParam);
        }

        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        // Chỉ Admin mới thấy sản phẩm bị ẩn (active: false)
        let filter = { ...keyword };

        // Lọc theo Section cụ thể (Lấy danh sách ID sản phẩm từ Section)
        if (req.query.sectionId) {
            const section = await Section.findById(req.query.sectionId);
            if (section && section.products.length > 0) {
                filter._id = { $in: section.products };
            } else {
                // Nếu section trống, không trả về sản phẩm nào
                filter._id = { $in: [] };
            }
        }
        if (req.query.gender) {
            if (req.query.gender === 'Nam' || req.query.gender === 'Nữ') {
                filter.gender = { $in: [req.query.gender, 'Unisex'] };
            } else {
                filter.gender = req.query.gender;
            }
        }

        if (req.query.category) {
            const Category = require('../models/Category');
            // Tìm các danh mục con nếu đây là danh mục cha
            const subCategories = await Category.find({ parent: req.query.category }).select('_id');
            if (subCategories.length > 0) {
                const catIds = subCategories.map(c => c._id);
                catIds.push(req.query.category); // Bao gồm cả chính nó
                filter.category = { $in: catIds };
            } else {
                filter.category = req.query.category;
            }
        }

        // Lọc theo thương hiệu cụ thể
        if (req.query.brand) {
            filter.brand = req.query.brand;
        }

        // Lọc theo khoảng giá
        if (req.query.priceRange) {
            const [min, max] = req.query.priceRange.split('-').map(Number);
            if (!isNaN(min) && !isNaN(max)) {
                filter.price = { $gte: min, $lte: max };
            }
        }

        if (!isAdmin) {
            filter.active = true;
            // Nếu chưa lọc theo brand cụ thể, chỉ lấy SP của brand đang active
            if (!req.query.brand) {
                const Brand = require('../models/Brand');
                const activeBrands = await Brand.find({ active: true }).select('_id');
                const activeBrandIds = activeBrands.map(b => b._id);
                filter.brand = { $in: activeBrandIds };
            }
        }

        // Xử lý sắp xếp
        let sortOption = { createdAt: -1 }; // Mặc định: mới nhất
        if (req.query.sort === 'price_asc') {
            sortOption = { price: 1 };
        } else if (req.query.sort === 'price_desc') {
            sortOption = { price: -1 };
        }

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category')
            .populate('brand')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortOption);

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('brand');

        if (product) {
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Không tìm thấy sản phẩm');
        }
    } catch (error) {
        next(error);
    }
};

const getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category')
            .populate('brand');

        if (product) {
            // Nếu sản phẩm bị ẩn, chỉ Admin mới được xem chi tiết
            if (!product.active && (!req.user || req.user.role !== 'ADMIN')) {
                res.status(404);
                throw new Error('Sản phẩm hiện không khả dụng');
            }
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Không tìm thấy sản phẩm');
        }
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { name, sku, description, price, stock, categoryId, brandId, isHot, gender } = req.body;
        let { mainImageUrl, secondaryImages } = req.body;

        if (req.files && req.files.length > 0) {
            mainImageUrl = req.files[0].path;
            secondaryImages = req.files.slice(1).map(file => file.path);
        }

        const slugify = (str) => {
            if (!str) return "";
            return str
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/([^0-9a-z-\s])/g, "")
                .replace(/(\s+)/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");
        };

        const slug = slugify(name);

        const product = new Product({
            name,
            slug,
            sku,
            description,
            price,
            stock,
            category: categoryId,
            brand: brandId,
            mainImageUrl,
            secondaryImages,
            isHot,
            gender
        });

        const createdProduct = await product.save();
        
        // Thông báo nếu hàng nhập về thấp
        if (stock < 10) {
            const Notification = require('../models/Notification');
            await Notification.create({
                title: 'Sắp hết hàng!',
                message: `Sản phẩm ${name} vừa được tạo với số lượng thấp (${stock})`,
                type: 'STOCK',
                link: '/admin/products',
                relatedId: createdProduct._id
            });
        }

        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { name, sku, description, price, stock, categoryId, brandId, isHot, active, isActive, gender } = req.body;
        let { mainImageUrl, secondaryImages } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            if (req.files && req.files.length > 0) {
                mainImageUrl = req.files[0].path;
                if (req.files.length > 1) {
                   secondaryImages = req.files.slice(1).map(file => file.path);
                }
            }

            product.name = name || product.name;
            product.sku = sku || product.sku;
            product.description = description || product.description;
            product.price = price !== undefined ? price : product.price;
            product.stock = stock !== undefined ? stock : product.stock;
            product.category = categoryId || product.category;
            product.brand = brandId || product.brand;
            product.mainImageUrl = mainImageUrl || product.mainImageUrl;
            product.secondaryImages = secondaryImages || product.secondaryImages;
            product.isHot = isHot !== undefined ? isHot : product.isHot;
            product.gender = gender || product.gender;
            // Hỗ trợ cả 'active' và 'isActive' từ frontend
            const activeValue = isActive !== undefined ? isActive : active;
            if (activeValue !== undefined) {
                product.active = (activeValue === 'true' || activeValue === true);
            }

            const updatedProduct = await product.save();

            // Nếu số lượng tồn kho thấp hơn 10 -> Thông báo cho Admin
            if (updatedProduct.stock < 10) {
                const Notification = require('../models/Notification');
                await Notification.create({
                    title: 'Cảnh báo tồn kho!',
                    message: `Sản phẩm ${updatedProduct.name} hiện chỉ còn ${updatedProduct.stock} sản phẩm trong kho.`,
                    type: 'STOCK',
                    link: '/admin/products',
                    relatedId: updatedProduct._id
                });
            }

            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Sản phẩm không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Kiểm tra ràng buộc: xem đã có ai mua sản phẩm này chưa
            const orderCount = await Order.countDocuments({ "orderItems.product": req.params.id });
            if (orderCount > 0) {
                res.status(400);
                throw new Error(`Sản phẩm này đã có trong ${orderCount} đơn hàng. Không thể xóa để bảo toàn lịch sử giao dịch. Vui lòng sử dụng chức năng ẨN sản phẩm thay thế.`);
            }

            await product.deleteOne();
            res.json({ message: 'Đã xóa sản phẩm thành công' });
        } else {
            res.status(404);
            throw new Error('Sản phẩm không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
};
