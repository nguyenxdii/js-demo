require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Banner = require('../models/Banner');
const Section = require('../models/Section');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected for Seeding');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error);
        process.exit(1);
    }
};

const seedBanners = async () => {
    try {
        await Banner.deleteMany();
        const banners = [
            {
                title: "Nike Air Max Pulse - Phá vỡ giới hạn",
                imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000",
                linkUrl: "/products",
                position: "HOME_MAIN"
            },
            {
                title: "Yonex Astrox 100ZZ - Đẳng cấp nhà vô địch",
                imageUrl: "https://images.unsplash.com/photo-1626225967045-9c76db7b6ec4?auto=format&fit=crop&q=80&w=2000",
                linkUrl: "/products",
                position: "HOME_MAIN"
            },
            {
                title: "BST Thu Đông 2024 - Khơi dậy đam mê",
                imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2000",
                linkUrl: "/products",
                position: "HOME_MAIN"
            }
        ];
        await Banner.insertMany(banners);
        console.log('✅ Đã nạp 3 Banner quảng cáo cực chất.');
    } catch (error) {
        console.error('❌ Lỗi nạp Banner:', error);
    }
};

const seedSections = async (products) => {
    try {
        await Section.deleteMany();
        if (!products || products.length === 0) return;

        // Xáo trộn sản phẩm để lấy ngẫu nhiên
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        
        const sectionsData = [
            {
                title: "SĂN SALE GIỜ VÀNG",
                description: "Cơ hội sở hữu đồ tập cao cấp với giá hời nhất trong ngày.",
                layoutType: "FLASH_SALE",
                active: true,
                order: 1,
                products: shuffled.slice(0, 4).map(p => p._id),
                discountConfig: { active: true, label: "GIẢM SỐC", discountPercentage: 30 }
            },
            {
                title: "BỘ SƯU TẬP MỚI VỀ",
                description: "Những thiết kế mới nhất từ Nike, Adidas và Yonex.",
                layoutType: "NEW_ARRIVAL",
                active: true,
                order: 2,
                products: shuffled.slice(4, 9).map(p => p._id)
            },
            {
                title: "SẢN PHẨM TIÊU BIỂU",
                description: "Lựa chọn hàng đầu cho các vận động viên chuyên nghiệp.",
                layoutType: "STANDARD",
                active: true,
                order: 3,
                products: shuffled.slice(9, 14).map(p => p._id)
            }
        ];

        await Section.insertMany(sectionsData);
        console.log('✅ Đã nạp 3 Section trang chủ sinh động.');
    } catch (error) {
        console.error('❌ Lỗi nạp Section:', error);
    }
};

const seedOrders = async (products, users) => {
    try {
        if (!users || users.length === 0 || !products || products.length === 0) {
            console.log('⚠️ Không có User hoặc Product để tạo đơn hàng mẫu.');
            return;
        }

        const ordersData = [];
        const user = users[0];
        
        console.log('⏳ Đang tạo 15 đơn hàng mẫu để kiểm thử Dashboard...');

        for (let i = 0; i < 15; i++) {
            // Lấy 1-2 sản phẩm ngẫu nhiên
            const numItems = Math.floor(Math.random() * 2) + 1;
            const selectedProducts = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const randomP = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 2) + 1;
                selectedProducts.push({
                    product: randomP._id,
                    productName: randomP.name,
                    productImage: randomP.mainImageUrl,
                    quantity: qty,
                    price: randomP.price
                });
                totalAmount += randomP.price * qty;
            }

            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 180));
            
            ordersData.push({
                user: user._id,
                orderCode: 'SGS' + Date.now() + Math.floor(Math.random() * 1000) + i,
                fullName: user.fullName || 'User Test',
                email: user.email || 'test@example.com',
                phoneNumber: user.phoneNumber || '0987654321',
                address: user.address || 'Hồ Chí Minh, Việt Nam',
                totalAmount: totalAmount,
                paymentMethod: i % 2 === 0 ? 'MOMO' : 'COD',
                paymentStatus: 'PAID',
                status: 'DELIVERED',
                items: selectedProducts,
                createdAt: date,
                updatedAt: date
            });
        }

        await Order.insertMany(ordersData);
        console.log(`✅ Đã nạp thêm thành công 40 đơn hàng mẫu.`);
    } catch (error) {
        console.error('❌ Lỗi nạp đơn hàng:', error);
    }
};

const importData = async () => {
    try {
        await connectDB();
        
        console.log('🚀 Đang kiểm tra và cập nhật dữ liệu hệ thống...');

        // 1. Đảm bảo có tài khoản Admin mặc định
        let adminUser = await User.findOne({ email: 'admin@gmail.com' });
        if (!adminUser) {
            adminUser = await User.create({
                fullName: 'Admin Sport Gear',
                email: 'admin@gmail.com',
                password: '123qwe123', // Sẽ được hash tự động bởi User model pre-save hook
                role: 'ADMIN',
                active: true
            });
            console.log('✅ Khởi tạo tài khoản Admin mặc định thành công.');
        } else {
            console.log('ℹ️ Tài khoản Admin đã tồn tại.');
        }

        // 2. Seed Brands (Chỉ thêm nếu chưa có)
        const brandCount = await Brand.countDocuments();
        let brands = [];
        if (brandCount === 0) {
            const brandsData = [
                { name: "Nike", slug: "nike", active: true, logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
                { name: "Adidas", slug: "adidas", active: true, logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
                { name: "Yonex", slug: "yonex", active: true, logoUrl: "https://i.pinimg.com/736x/19/64/d0/1964d07c9e625f0804ca7d890beacfa7.jpg" },
                { name: "Puma", slug: "puma", active: true, logoUrl: "https://thumbs.dreamstime.com/b/vinnitsa-ukraine-october-puma-sport-brand-logo-icon-vinnitsa-ukraine-october-puma-sport-brand-logo-icon-vector-editorial-260965684.jpg" },
                { name: "Asics", slug: "asics", active: true, logoUrl: "https://i.pinimg.com/736x/67/05/70/6705701c0a77e399932e4b171c11e716.jpg" },
                { name: "Victor", slug: "victor", active: true, logoUrl: "https://images.seeklogo.com/logo-png/16/1/victor-sport-logo-png_seeklogo-168727.png" },
                { name: "Lining", slug: "lining", active: true, logoUrl: "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-lining-inkythuatso-21-14-57-44.jpg" }
            ];
            brands = await Brand.insertMany(brandsData);
            console.log('✅ Đã nạp danh sách Thương hiệu.');
        } else {
            brands = await Brand.find();
            console.log('ℹ️ Đã có dữ liệu Thương hiệu, bỏ qua bước nạp.');
        }

        // 3. Seed Categories (Chỉ thêm nếu chưa có)
        const catCount = await Category.countDocuments();
        let subCats = [];
        if (catCount === 0) {
            const mainCategories = [
                { name: "Giày Thể Thao", slug: "giay-the-thao", active: true },
                { name: "Trang Phục Thể Thao", slug: "trang-phục-the-thao", active: true },
                { name: "Dụng Cụ Vợt", slug: "dung-cu-vot", active: true }
            ];
            const savedMainCats = await Category.insertMany(mainCategories);

            const subCategoriesData = [
                { name: "Giày Chạy Bộ (Running)", slug: "giay-chay-bo", parent: savedMainCats[0]._id, brands: [brands[0]._id, brands[1]._id] },
                { name: "Giày Đá Bóng (Football)", slug: "giay-da-bong", parent: savedMainCats[0]._id, brands: [brands[0]._id, brands[1]._id] },
                { name: "Vợt Cầu Lông", slug: "vot-cau-long", parent: savedMainCats[2]._id, brands: [brands[2]._id, brands[6]._id] }
            ];
            subCats = await Category.insertMany(subCategoriesData);
            console.log('✅ Đã nạp danh mục Sản phẩm.');
        } else {
            subCats = await Category.find({ parent: { $ne: null } });
            console.log('ℹ️ Đã có dữ liệu Danh mục, bỏ qua bước nạp.');
        }

        // 4. Seed Products (Chỉ thêm nếu chưa có)
        const prodCount = await Product.countDocuments();
        let products = [];
        if (prodCount === 0) {
            const productsData = [];
            const addP = (catId, productName, brandId, image) => {
                productsData.push({
                    name: productName,
                    slug: productName.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000),
                    sku: 'SKU-' + Math.floor(Math.random() * 100000),
                    category: catId,
                    brand: brandId,
                    price: Math.floor(Math.random() * 2000000) + 500000,
                    stock: 50,
                    description: `Sản phẩm mẫu ${productName}`,
                    mainImageUrl: `/uploads/products/${image}`,
                    active: true,
                    gender: "Unisex"
                });
            };

            if (subCats.length > 0) {
                // Tạo 15 sản phẩm mẫu đa dạng
                const samples = [
                    { name: "Nike Air Zoom Pegasus 40", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", price: 3200000, cat: subCats[0], brand: brands[0] },
                    { name: "Adidas Ultraboost Light", img: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb", price: 4500000, cat: subCats[0], brand: brands[1] },
                    { name: "Yonex Astrox 100ZZ", img: "https://images.unsplash.com/photo-1626225967045-9c76db7b6ec4", price: 3850000, cat: subCats[2], brand: brands[2] },
                    { name: "Puma Velocity Nitro", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a", price: 2900000, cat: subCats[0], brand: brands[3] },
                    { name: "Victor Thruster Ryuga", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", price: 3100000, cat: subCats[2], brand: brands[5] },
                    { name: "Lining Tectonic 9", img: "https://images.unsplash.com/photo-1617050318658-a9a3175e34cb", price: 2800000, cat: subCats[2], brand: brands[6] },
                    { name: "Nike Mercurial Vapor 15", img: "https://images.unsplash.com/photo-1511746315387-c4a76990fdce", price: 5600000, cat: subCats[1], brand: brands[0] },
                    { name: "Adidas Predator Elite", img: "https://images.unsplash.com/photo-1539185441755-769473a23570", price: 6200000, cat: subCats[1], brand: brands[1] },
                    { name: "Asics Gel-Kayano 30", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5", price: 3990000, cat: subCats[0], brand: brands[4] },
                    { name: "Nike Dri-FIT Adv", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f", price: 1200000, cat: subCats[1], brand: brands[0] },
                    { name: "Adidas Z.N.E Hoodie", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7", price: 2500000, cat: subCats[1], brand: brands[1] },
                    { name: "Yonex Power Cushion 65 Z3", img: "https://images.unsplash.com/photo-1534346917637-23b0923e200c", price: 2650000, cat: subCats[2], brand: brands[2] },
                    { name: "Puma King Ultimate", img: "https://images.unsplash.com/photo-1543508282-6319a3e2621f", price: 4200000, cat: subCats[1], brand: brands[3] },
                    { name: "Asics Metaspeed Sky+", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa", price: 6500000, cat: subCats[0], brand: brands[4] },
                    { name: "Victor Auraspeed 100X", img: "https://images.unsplash.com/photo-1626225967045-9c76db7b6ec4", price: 3400000, cat: subCats[2], brand: brands[5] }
                ];

                samples.forEach(s => {
                    productsData.push({
                        name: s.name,
                        slug: s.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000),
                        sku: 'SKU-' + Math.floor(Math.random() * 100000),
                        category: s.cat._id,
                        brand: s.brand._id,
                        price: s.price,
                        oldPrice: s.price + 500000,
                        stock: 100,
                        description: `${s.name} là sản phẩm thể thao cao cấp nhất, mang lại hiệu suất vượt trội cho vận động viên chuyên nghiệp.`,
                        mainImageUrl: s.img,
                        active: true,
                        isHot: Math.random() > 0.5,
                        gender: "Unisex"
                    });
                });
            }

            products = await Product.insertMany(productsData);
            console.log(`✅ Đã nạp ${products.length} Sản phẩm mẫu cao cấp.`);
        } else {
            products = await Product.find();
            console.log('ℹ️ Đã có dữ liệu Sản phẩm, bỏ qua bước nạp.');
        }

        // 5. Nạp Banners và Sections cho trang chủ
        await seedBanners();
        await seedSections(products);

        // 6. Luôn nạp thêm Đơn hàng mẫu mỗi khi chạy lệnh seed (theo yêu cầu)
        const users = await User.find({ role: 'ADMIN' }).limit(1);
        await seedOrders(products, users);

        console.log('🎉 TOÀN BỘ QUÁ TRÌNH CẬP NHẬT HOÀN TẤT!');
        process.exit();
    } catch (error) {
        console.error('❌ Lỗi Seeding:', error);
        process.exit(1);
    }
};

importData();
