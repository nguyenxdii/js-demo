const User = require('../models/User');
const { sendOtpEmail } = require('../services/emailService');

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('Người dùng không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.address = req.body.address || user.address;
            
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
                avatarUrl: updatedUser.avatarUrl,
                role: updatedUser.role,
            });
        } else {
            res.status(404);
            throw new Error('Người dùng không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const updateAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Assume the image is uploaded via Cloudinary middleware and available in req.file.path
            if (req.file && req.file.path) {
                user.avatarUrl = req.file.path;
                const updatedUser = await user.save();
                res.json({ avatarUrl: updatedUser.avatarUrl });
            } else {
                res.status(400);
                throw new Error('Vui lòng chọn hình ảnh để tải lên');
            }
        } else {
            res.status(404);
            throw new Error('Người dùng không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const toggleLock = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Dùng updateOne để tránh trigger pre-save bcrypt hook
            const newLockedStatus = !user.locked;
            await User.updateOne({ _id: req.params.id }, { locked: newLockedStatus });
            res.json({ 
                message: `${newLockedStatus ? 'Khóa' : 'Mở khóa'} tài khoản thành công`,
                locked: newLockedStatus 
            });
        } else {
            res.status(404);
            throw new Error('Người dùng không tìm thấy');
        }
    } catch (error) {
        next(error);
    }
};

const requestPasswordOtp = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const { currentPassword } = req.body;

        if (user && (await user.matchPassword(currentPassword))) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.verificationCode = otp;
            user.verificationCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
            await user.save();

            await sendOtpEmail(user.email, otp, 'FORGOT_PASSWORD');
            res.json({ message: "OTP đã được gửi" });
        } else {
            res.status(401);
            throw new Error('Mật khẩu hiện tại không đúng');
        }
    } catch (error) {
        next(error);
    }
};

const confirmPasswordChange = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const { otp, newPassword } = req.body;

        if (user) {
            if (user.verificationCode !== otp || user.verificationCodeExpiresAt < Date.now()) {
                res.status(400);
                throw new Error('Mã OTP không đúng hoặc đã hết hạn');
            }

            user.password = newPassword;
            user.verificationCode = undefined;
            user.verificationCodeExpiresAt = undefined;
            await user.save();

            res.json({ message: "Đổi mật khẩu thành công" });
        } else {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateProfile,
    updateAvatar,
    toggleLock,
    requestPasswordOtp,
    confirmPasswordChange,
};
