require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/Brand');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected for updating brand logos');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const brandsToUpdate = [
    { name: "Asics", logoUrl: "https://i.pinimg.com/736x/67/05/70/6705701c0a77e399932e4b171c11e716.jpg" },
    { name: "Lining", logoUrl: "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-lining-inkythuatso-21-14-57-44.jpg" },
    { name: "Mizuno", logoUrl: "https://i.pinimg.com/736x/54/50/1e/54501e61b51a274395e2ec1e91dd5641.jpg" },
    { name: "Puma", logoUrl: "https://thumbs.dreamstime.com/b/vinnitsa-ukraine-october-puma-sport-brand-logo-icon-vinnitsa-ukraine-october-puma-sport-brand-logo-icon-vector-editorial-260965684.jpg" },
    { name: "Victor", logoUrl: "https://images.seeklogo.com/logo-png/16/1/victor-sport-logo-png_seeklogo-168727.png" },
    { name: "Wilson", logoUrl: "https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/0018/3765/brand.gif?itok=vmHjGDS6" },
    { name: "Yonex", logoUrl: "https://i.pinimg.com/736x/19/64/d0/1964d07c9e625f0804ca7d890beacfa7.jpg" }
];

const updateLogos = async () => {
    try {
        await connectDB();
        
        for (const brand of brandsToUpdate) {
            const result = await Brand.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${brand.name}$`, 'i') } },
                { logoUrl: brand.logoUrl },
                { new: true }
            );
            
            if (result) {
                console.log(`✅ Updated logo for: ${brand.name}`);
            } else {
                console.log(`⚠️ Brand not found: ${brand.name}`);
            }
        }
        
        console.log('🎉 Update process completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Update Error:', error);
        process.exit(1);
    }
};

updateLogos();
