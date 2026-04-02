require("dotenv").config();
const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Section = require("../models/Section");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const categoryImages = {
  "Giày Chạy Bộ (Running)": "Giày Chạy Bộ (Running).jpg",
  "Giày Đá Bóng (Football)": "Giày Đá Bóng (Football).webp",
  "Giày Cầu Lông (Badminton)": "Giày Cầu Lông (Badminton).jpg",
  "Giày Bóng Rổ (Basketball)": "Giày Bóng Rổ (Basketball).jpg",
  "Giày Tennis": "Giày Tennis.webp",
  "Giày Tập Gym (Training)": "Giày Tập Gym (Training).webp",
  "Áo Thun & Polo": "Áo Thun & Polo.jpg",
  "Quần Short": "Quần Short.jpg",
  "Áo Khoác (Jackets)": "Áo Khoác (Jackets).webp",
  "Quần Jogger-Dài": "Quần Jogger-Dài.webp",
  "Bộ Đồ Thể Thao (Sets)": "Bộ Đồ Thể Thao (Sets).png",
  "Vợt Cầu Lông": "Vợt Cầu Lông.jpg",
  "Vợt Tennis": "Vợt Tennis.webp",
  "Vợt Pickleball": "Vợt Pickleball.jpg",
  "Túi & Bao Vợt": "Túi & Bao Vợt.jpeg",
  "Bình Nước": "Bình Nước.jpg",
  "Phụ Kiện Giày": "Phụ Kiện Giày.jpeg",
  "Thảm Tập Yoga": "Thảm Tập Yoga.png",
  "Tạ Tay & Tạ Đòn": "Tạ Tay & Tạ Đòn.jpg",
  "Dây Kháng Lực (Resistance Bands)": "Dây Kháng Lực (Resistance Bands).jpg",
};

const productImages = [
  "Adidas Dame 8 EXTPLY.webp",
  "Adidas Predator Accuracy.3 TF.jpg",
  "Adidas Ultraboost Light 23.jpeg",
  "Asics Court FF 3 Novak.jpeg",
  "Asics Gel-Kayano 29.jpeg",
  "Nike Air Zoom Pegasus 40.jpeg",
  "Nike Court Air Zoom Vapor Pro 2.jpg",
  "Nike Mercurial Superfly 9 Academy.jpeg",
  "Puma Future Ultimate FG-AG.jpeg",
  "Under Armour Curry Flow 10.png",
  "Victor P9200TD Đen Trắng.jpeg",
  "Yonex Power Cushion 65 Z3.webp",
];

const importData = async () => {
  try {
    await connectDB();

    console.log("ℹ️ Đang kiểm tra dữ liệu hiện có...");
    const existingProductsCount = await Product.countDocuments();
    
    // 0. Tạo/Cập nhật tài khoản Admin
    console.log("👤 Đang thiết lập tài khoản Admin...");
    const adminEmail = 'admin@gmail.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
        adminUser = await User.create({
            fullName: 'Admin Sport Gear',
            email: adminEmail,
            password: '123wqe123',
            role: 'ADMIN',
            active: true
        });
        console.log("✅ Đã tạo tài khoản Admin mới: admin@gmail.com / 123wqe123");
    } else {
        adminUser.password = '123wqe123';
        await adminUser.save();
        console.log("✅ Đã cập nhật mật khẩu Admin: admin@gmail.com / 123wqe123");
    }

    // Cập nhật Thương hiệu
    const brandsData = [
      { name: "Nike", slug: "nike", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
      { name: "Adidas", slug: "adidas", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
      { name: "Yonex", slug: "yonex", logoUrl: "https://i.pinimg.com/736x/19/64/d0/1964d07c9e625f0804ca7d890beacfa7.jpg" },
      { name: "Puma", slug: "puma", logoUrl: "https://thumbs.dreamstime.com/b/vinnitsa-ukraine-october-puma-sport-brand-logo-icon-vinnitsa-ukraine-october-puma-sport-brand-logo-icon-vector-editorial-260965684.jpg" },
      { name: "Asics", slug: "asics", logoUrl: "https://i.pinimg.com/736x/67/05/70/6705701c0a77e399932e4b171c11e716.jpg" },
      { name: "Victor", slug: "victor", logoUrl: "https://images.seeklogo.com/logo-png/16/1/victor-sport-logo-png_seeklogo-168727.png" },
      { name: "Lining", slug: "lining", logoUrl: "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-lining-inkythuatso-21-14-57-44.jpg" },
      { name: "Under Armour", slug: "under-armour", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_Armour_logo.svg" },
    ];

    for (const b of brandsData) {
      await Brand.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
    }
    const brands = await Brand.find();

    let products = [];
    if (existingProductsCount < 10) {
        console.log("👟 Dữ liệu sản phẩm trống, đang tạo 150 sản phẩm mẫu...");
        // Tạo Danh mục
        const lv1Names = ["Giày Thể Thao", "Trang Phục Thể Thao", "Dụng Cụ Vợt", "Phụ Kiện Thể Thao", "Thiết Bị & Máy Tập"];
        const lv1Cats = [];
        for (const name of lv1Names) {
          const cat = await Category.create({ name, slug: slugify(name), active: true });
          lv1Cats.push(cat);
        }

        const lv2Config = [
          { parent: lv1Cats[0], subs: ["Giày Chạy Bộ (Running)", "Giày Đá Bóng (Football)", "Giày Cầu Lông (Badminton)", "Giày Bóng Rổ (Basketball)", "Giày Tennis", "Giày Tập Gym (Training)"] },
          { parent: lv1Cats[1], subs: ["Áo Thun & Polo", "Quần Short", "Áo Khoác (Jackets)", "Quần Jogger-Dài", "Bộ Đồ Thể Thao (Sets)"] },
          { parent: lv1Cats[2], subs: ["Vợt Cầu Lông", "Vợt Tennis", "Vợt Pickleball", "Túi & Bao Vợt"] },
          { parent: lv1Cats[3], subs: ["Bình Nước", "Phụ Kiện Giày", "Tất & Vớ"] },
          { parent: lv1Cats[4], subs: ["Thảm Tập Yoga", "Tạ Tay & Tạ Đòn", "Dây Kháng Lực (Resistance Bands)"] }
        ];

        const allLv2Cats = [];
        for (const config of lv2Config) {
          for (const subName of config.subs) {
            const img = categoryImages[subName] || "Phụ Kiện Giày.jpeg";
            const cat = await Category.create({
              name: subName, slug: slugify(subName), parent: config.parent._id,
              imageUrl: `/uploads/categories/${img}`, active: true, brands: brands.map(b => b._id)
            });
            allLv2Cats.push(cat);
          }
        }

        const productsData = [];
        const productNames = ["Pro", "Elite", "Plus", "Classic", "Turbo", "Swift", "Ultra", "Max", "Prime", "Velocity"];
        for (let i = 0; i < 150; i++) {
          const cat = allLv2Cats[Math.floor(Math.random() * allLv2Cats.length)];
          const brand = brands[Math.floor(Math.random() * brands.length)];
          const name = `${cat.name} ${brand.name} ${productNames[i % 10]} Gen ${Math.floor(Math.random() * 5) + 1}`;
          const price = Math.floor(Math.random() * 450) * 10000 + 200000;
          productsData.push({
            name, slug: slugify(name) + "-" + Date.now() + i, sku: `SGS-${1000 + i}`,
            description: `Mô tả sản phẩm ${name}`, price, stock: 100,
            mainImageUrl: `/uploads/products/${productImages[i % productImages.length]}`,
            category: cat._id, brand: brand._id, active: true
          });
        }
        products = await Product.insertMany(productsData);
    } else {
        products = await Product.find().limit(100);
        console.log(`ℹ️ Đã có ${existingProductsCount} sản phẩm, bỏ qua bước tạo mới.`);
    }

    // 5. TẠO 100 ĐƠN HÀNG MẪU ĐỂ THỐNG KÊ
    console.log("📊 Đang tạo 100 đơn hàng mẫu rải rác trong 90 ngày...");
    const ordersData = [];
    const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'CANCELLED'];
    
    for (let i = 0; i < 100; i++) {
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subTotal = 0;
        
        for (let j = 0; j < itemCount; j++) {
            const prod = products[Math.floor(Math.random() * products.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            items.push({
                product: prod._id,
                productName: prod.name,
                productImage: prod.mainImageUrl,
                quantity: qty,
                price: prod.price
            });
            subTotal += prod.price * qty;
        }

        const shippingFee = subTotal > 1000000 ? 0 : 30000;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));

        ordersData.push({
            user: adminUser._id,
            orderCode: `ORDER-${Date.now()}-${i}`,
            fullName: `Khách hàng ${i + 1}`,
            email: `customer${i}@example.com`,
            phoneNumber: '0901234567',
            address: 'Địa chỉ mẫu, Việt Nam',
            items,
            totalAmount: subTotal + shippingFee,
            shippingFee,
            status,
            paymentMethod: Math.random() > 0.5 ? 'COD' : 'MOMO',
            paymentStatus: status === 'DELIVERED' ? 'PAID' : 'UNPAID',
            createdAt: date,
            updatedAt: date
        });
    }

    await Order.insertMany(ordersData);
    console.log("✅ Đã nạp thành công 100 đơn hàng mẫu.");

    console.log("🎉 XONG! Dữ liệu đã sẵn sàng cho thống kê.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi Seeder:", error);
    process.exit(1);
  }
};

importData();
