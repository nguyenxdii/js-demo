require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Γ£à MongoDB Connected for Seeding');
    } catch (error) {
        console.error('Γ¥î Lß╗ùi kß║┐t nß╗æi MongoDB:', error);
        process.exit(1);
    }
};

const seedOrders = async (products, users) => {
    try {
        if (!users || users.length === 0 || !products || products.length === 0) {
            console.log('ΓÜá∩╕Å Kh├┤ng c├│ User hoß║╖c Product ─æß╗â tß║ío ─æ╞ín h├áng mß║½u.');
            return;
        }

        const ordersData = [];
        const user = users[0];
        
        console.log('ΓÅ│ ─Éang tß║ío 15 ─æ╞ín h├áng mß║½u ─æß╗â kiß╗âm thß╗¡ Dashboard...');

        for (let i = 0; i < 15; i++) {
            // Lß║Ñy 1-2 sß║ún phß║⌐m ngß║½u nhi├¬n
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
                address: user.address || 'Hß╗ô Ch├¡ Minh, Viß╗çt Nam',
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
        console.log(`Γ£à ─É├ú nß║íp th├¬m th├ánh c├┤ng 40 ─æ╞ín h├áng mß║½u.`);
    } catch (error) {
        console.error('Γ¥î Lß╗ùi nß║íp ─æ╞ín h├áng:', error);
    }
};

const importData = async () => {
    try {
        await connectDB();
        
        console.log('≡ƒÜÇ ─Éang kiß╗âm tra v├á cß║¡p nhß║¡t dß╗» liß╗çu hß╗ç thß╗æng...');

        // 1. ─Éß║úm bß║úo c├│ t├ái khoß║ún Admin mß║╖c ─æß╗ïnh
        let adminUser = await User.findOne({ email: 'admin@gmail.com' });
        if (!adminUser) {
            adminUser = await User.create({
                fullName: 'Admin Sport Gear',
                email: 'admin@gmail.com',
                password: '123qwe123', // Sß║╜ ─æ╞░ß╗úc hash tß╗▒ ─æß╗Öng bß╗ƒi User model pre-save hook
                role: 'ADMIN',
                active: true
            });
            console.log('Γ£à Khß╗ƒi tß║ío t├ái khoß║ún Admin mß║╖c ─æß╗ïnh th├ánh c├┤ng.');
        } else {
            console.log('Γä╣∩╕Å T├ái khoß║ún Admin ─æ├ú tß╗ôn tß║íi.');
        }

        // 2. Seed Brands (Chß╗ë th├¬m nß║┐u ch╞░a c├│)
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
            console.log('Γ£à ─É├ú nß║íp danh s├ích Th╞░╞íng hiß╗çu.');
        } else {
            brands = await Brand.find();
            console.log('Γä╣∩╕Å ─É├ú c├│ dß╗» liß╗çu Th╞░╞íng hiß╗çu, bß╗Å qua b╞░ß╗¢c nß║íp.');
        }

        // 3. Seed Categories (Chß╗ë th├¬m nß║┐u ch╞░a c├│)
        const catCount = await Category.countDocuments();
        let subCats = [];
        if (catCount === 0) {
            const mainCategories = [
                { name: "Gi├áy Thß╗â Thao", slug: "giay-the-thao", active: true },
                { name: "Trang Phß╗Ñc Thß╗â Thao", slug: "trang-phß╗Ñc-the-thao", active: true },
                { name: "Dß╗Ñng Cß╗Ñ Vß╗út", slug: "dung-cu-vot", active: true }
            ];
            const savedMainCats = await Category.insertMany(mainCategories);

            const subCategoriesData = [
                { name: "Gi├áy Chß║íy Bß╗Ö (Running)", slug: "giay-chay-bo", parent: savedMainCats[0]._id, brands: [brands[0]._id, brands[1]._id] },
                { name: "Gi├áy ─É├í B├│ng (Football)", slug: "giay-da-bong", parent: savedMainCats[0]._id, brands: [brands[0]._id, brands[1]._id] },
                { name: "Vß╗út Cß║ºu L├┤ng", slug: "vot-cau-long", parent: savedMainCats[2]._id, brands: [brands[2]._id, brands[6]._id] }
            ];
            subCats = await Category.insertMany(subCategoriesData);
            console.log('Γ£à ─É├ú nß║íp danh mß╗Ñc Sß║ún phß║⌐m.');
        } else {
            subCats = await Category.find({ parent: { $ne: null } });
            console.log('Γä╣∩╕Å ─É├ú c├│ dß╗» liß╗çu Danh mß╗Ñc, bß╗Å qua b╞░ß╗¢c nß║íp.');
        }

        // 4. Seed Products (Chß╗ë th├¬m nß║┐u ch╞░a c├│)
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
                    description: `Sß║ún phß║⌐m mß║½u ${productName}`,
                    mainImageUrl: `/uploads/products/${image}`,
                    active: true,
                    gender: "Unisex"
                });
            };

            if (subCats.length > 0) {
                addP(subCats[0]._id, "Nike Pegasus Trail", brands[0]._id, "Nike Air Zoom Pegasus 40.jpeg");
                addP(subCats[1]._id, "Adidas Predator", brands[1]._id, "Adidas Predator Accuracy.3 TF.jpg");
                addP(subCats[2]._id, "Yonex Astrox 88D", brands[2]._id, "Yonex Power Cushion 65 Z3.webp");
            }

            products = await Product.insertMany(productsData);
            console.log(`Γ£à ─É├ú nß║íp ${products.length} Sß║ún phß║⌐m mß║½u.`);
        } else {
            products = await Product.find();
            console.log('Γä╣∩╕Å ─É├ú c├│ dß╗» liß╗çu Sß║ún phß║⌐m, bß╗Å qua b╞░ß╗¢c nß║íp.');
        }

        // 5. Lu├┤n nß║íp th├¬m ─É╞ín h├áng mß║½u mß╗ùi khi chß║íy lß╗çnh seed (theo y├¬u cß║ºu)
        const users = await User.find({ role: 'ADMIN' }).limit(1);
        await seedOrders(products, users);

        console.log('≡ƒÄë TO├ÇN Bß╗ÿ QU├ü TR├îNH Cß║¼P NHß║¼T HO├ÇN Tß║ñT!');
        process.exit();
    } catch (error) {
        console.error('Γ¥î Lß╗ùi Seeding:', error);
        process.exit(1);
    }
};

importData();
