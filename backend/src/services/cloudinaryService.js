const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sport-gear-studio',
        format: async (req, file) => 'jpg', // supports promises as well
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    },
});

const upload = multer({ storage: storage });

const uploadSingle = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'sport-gear-studio',
        });
        return result.secure_url;
    } catch (error) {
        throw new Error('Error uploading to Cloudinary');
    }
};

module.exports = { upload, uploadSingle };
