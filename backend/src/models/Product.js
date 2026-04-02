const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    oldPrice: {
        type: Number,
    },
    stock: {
        type: Number,
        default: 0,
    },
    mainImageUrl: {
        type: String,
    },
    secondaryImages: [String],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    isHot: {
        type: Boolean,
        default: false,
    },
    isNewProduct: {
        type: Boolean,
        default: true,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Unisex'],
        default: 'Unisex',
    }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
