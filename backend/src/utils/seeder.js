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

    console.log("🧹 Đang dọn dẹp dữ liệu cũ...");
    await Category.deleteMany();
    await Product.deleteMany();
    await Section.deleteMany();
    // Giữ lại Brand nhưng đảm bảo đủ các thương hiệu yêu cầu
    console.log("ℹ️ Đang cập nhật danh sách Thương hiệu...");
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
    console.log(`✅ Đã cập nhật ${brands.length} thương hiệu.`);

    // 1. Tạo 5 Danh mục cấp 1
    console.log("📁 Đang tạo danh mục cấp 1...");
    const lv1Names = [
      "Giày Thể Thao",
      "Trang Phục Thể Thao",
      "Dụng Cụ Vợt",
      "Phụ Kiện Thể Thao",
      "Thiết Bị & Máy Tập",
    ];

    const lv1Cats = [];
    for (const name of lv1Names) {
      const cat = await Category.create({
        name,
        slug: slugify(name),
        active: true,
      });
      lv1Cats.push(cat);
    }

    // 2. Tạo Danh mục cấp 2
    console.log("📁 Đang tạo danh mục cấp 2...");
    const lv2Config = [
      {
        parent: lv1Cats[0],
        subs: ["Giày Chạy Bộ (Running)", "Giày Đá Bóng (Football)", "Giày Cầu Lông (Badminton)", "Giày Bóng Rổ (Basketball)", "Giày Tennis", "Giày Tập Gym (Training)"]
      },
      {
        parent: lv1Cats[1],
        subs: ["Áo Thun & Polo", "Quần Short", "Áo Khoác (Jackets)", "Quần Jogger-Dài", "Bộ Đồ Thể Thao (Sets)"]
      },
      {
        parent: lv1Cats[2],
        subs: ["Vợt Cầu Lông", "Vợt Tennis", "Vợt Pickleball", "Túi & Bao Vợt"]
      },
      {
        parent: lv1Cats[3],
        subs: ["Bình Nước", "Phụ Kiện Giày", "Tất & Vớ"]
      },
      {
        parent: lv1Cats[4],
        subs: ["Thảm Tập Yoga", "Tạ Tay & Tạ Đòn", "Dây Kháng Lực (Resistance Bands)"]
      }
    ];

    const allLv2Cats = [];
    for (const config of lv2Config) {
      for (const subName of config.subs) {
        const img = categoryImages[subName] || "Phụ Kiện Giày.jpeg";
        const cat = await Category.create({
          name: subName,
          slug: slugify(subName),
          parent: config.parent._id,
          imageUrl: `/uploads/categories/${img}`,
          active: true,
          brands: brands.map(b => b._id), // Gán tất cả brand cho danh mục
        });
        allLv2Cats.push(cat);
      }
    }
    console.log(`✅ Đã tạo ${allLv2Cats.length} danh mục cấp 2.`);

    // 3. Tạo 150 Sản phẩm
    console.log("👟 Đang tạo 150 sản phẩm mẫu...");
    const productsData = [];
    const productNames = [
      "Pro Gear", "Elite Series", "Performance Plus", "Classic Vibe", "Turbo Edition",
      "Dynamic Flow", "Power Strike", "Swift Motion", "Ultra Comfort", "Max Support",
      "Prime Fit", "Aero Design", "Stealth Black", "Ocean Blue", "Crimson Red",
      "Legacy Edition", "Future Tech", "Zen Spirit", "Iron Strength", "Velocity"
    ];

    for (let i = 0; i < 150; i++) {
      const cat = allLv2Cats[Math.floor(Math.random() * allLv2Cats.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const suffix = productNames[Math.floor(Math.random() * productNames.length)];
      
      // Tạo tên tự nhiên hơn: [Loại] [Thương hiệu] [Dòng]
      let name = "";
      if (cat.name.includes("Giày")) name = `${cat.name} ${brand.name} ${suffix}`;
      else if (cat.name.includes("Áo") || cat.name.includes("Quần") || cat.name.includes("Bộ Đồ")) name = `${cat.name} ${brand.name} ${suffix}`;
      else if (cat.name.includes("Vợt")) name = `${cat.name} ${brand.name} ${suffix}`;
      else name = `${brand.name} ${cat.name} ${suffix}`;
      
      name += ` Gen ${Math.floor(Math.random() * 5) + 1}`; // Thêm hậu tố đời sản phẩm
      
      const price = Math.floor(Math.random() * 450) * 10000 + 200000;
      const image = productImages[i % productImages.length];

      productsData.push({
        name,
        slug: slugify(name) + "-" + Date.now() + i,
        sku: `SGS-${1000 + i}`,
        description: `Đây là mô tả chi tiết cho sản phẩm ${name}. Sản phẩm chất lượng cao dành cho người chơi thể thao chuyên nghiệp và phong trào.`,
        price,
        oldPrice: Math.random() > 0.5 ? price * 1.2 : undefined,
        stock: Math.floor(Math.random() * 100) + 10,
        mainImageUrl: `/uploads/products/${image}`,
        category: cat._id,
        brand: brand._id,
        active: true,
        isHot: Math.random() > 0.8,
        isNewProduct: Math.random() > 0.5,
        gender: ["Nam", "Nữ", "Unisex"][Math.floor(Math.random() * 3)],
      });
    }

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Đã nạp thành công 150 sản phẩm.`);

    // 4. Tạo Section đơn giản
    console.log("📺 Đang tạo các Section trang chủ...");
    const sections = [
      {
        title: "Sản phẩm mới nhất",
        type: "NEW_ARRIVAL",
        layoutType: "NEW_ARRIVAL",
        order: 1,
        products: createdProducts.slice(0, 10).map(p => p._id)
      },
      {
        title: "Flash Sale cuối tuần",
        type: "FLASH_SALE_1",
        layoutType: "FLASH_SALE",
        order: 2,
        discountConfig: { active: true, label: "Giảm tới 30%", discountPercentage: 30 },
        products: createdProducts.slice(20, 30).map(p => p._id)
      },
      {
        title: "Bán chạy nhất",
        type: "TOP_SELLING",
        layoutType: "BEST_SELLER",
        order: 3,
        products: createdProducts.slice(40, 50).map(p => p._id)
      },
      {
        title: "Gợi ý cho bạn",
        type: "CUSTOM",
        layoutType: "STANDARD",
        order: 4,
        products: createdProducts.slice(60, 75).map(p => p._id)
      }
    ];

    await Section.insertMany(sections);
    console.log("✅ Đã tạo 4 Section mẫu.");

    console.log("🎉 QUÁ TRÌNH SEED DỮ LIỆU HOÀN TẤT!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình nạp dữ liệu:", error);
    process.exit(1);
  }
};

importData();

