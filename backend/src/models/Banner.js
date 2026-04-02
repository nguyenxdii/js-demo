const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    linkUrl: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
    position: {
        type: String, // 'HOME_MAIN', 'HOME_SIDE', 'CATEGORY'
        default: 'HOME_MAIN',
    }
}, {
    timestamps: true,
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
