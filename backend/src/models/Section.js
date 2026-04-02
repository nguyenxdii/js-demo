const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['TOP_SELLING', 'NEW_ARRIVAL', 'FLASH_SALE_1', 'FLASH_SALE_2', 'FLASH_SALE_3', 'CATEGORY_HIGHLIGHT', 'CUSTOM'],
        default: 'CUSTOM',
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    layoutType: {
        type: String,
        enum: ['FLASH_SALE', 'NEW_ARRIVAL', 'BEST_SELLER', 'STANDARD', 'BANNER_PRODUCT'],
        default: 'STANDARD',
    },
    discountConfig: {
        active: { type: Boolean, default: false },
        label: { type: String, default: "Giảm giá sốc" },
        discountPercentage: { type: Number, default: 0 },
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    active: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const Section = mongoose.model('Section', sectionSchema);
module.exports = Section;
