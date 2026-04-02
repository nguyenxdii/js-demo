const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    brands: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    }],
    active: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
