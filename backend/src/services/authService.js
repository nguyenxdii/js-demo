const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOtpEmail } = require('./emailService');
const crypto = require('crypto');

const registerUser = async (userData) => {
    const { fullName, email, password, phoneNumber, address } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('Email đã được sử dụng. Vui lòng chọn email khác.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await User.create({
        fullName,
        email,
        password,
        phoneNumber,
        address,
        active: false,
        verificationCode: otp,
        verificationCodeExpiresAt: otpExpires,
        role: 'USER',
    });

    if (user) {
        await sendOtpEmail(email, otp, 'REGISTRATION');
        return {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.',
        };
    } else {
        throw new Error('Dữ liệu người dùng không hợp lệ.');
    }
};

const authUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.active) {
            throw new Error('Tài khoản chưa được kích hoạt. Vui lòng xác thực mã OTP qua email.');
        }
        if (user.locked) {
            throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        return {
            token: generateToken(user._id),
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
                avatarUrl: user.avatarUrl,
                role: user.role,
            }
        };
    } else {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }
};

const verifyOtp = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Người dùng không tồn tại.');
    }

    if (user.active) {
        throw new Error('Tài khoản đã được kích hoạt trước đó.');
    }

    if (user.verificationCode !== otp) {
        throw new Error('Mã xác thực không chính xác.');
    }

    if (user.verificationCodeExpiresAt < Date.now()) {
        throw new Error('Mã xác thực đã hết hạn.');
    }

    user.active = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    return {
        token: generateToken(user._id),
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            avatarUrl: user.avatarUrl,
            role: user.role,
        }
    };
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Email không tồn tại trong hệ thống.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.verificationCode = otp;
    user.verificationCodeExpiresAt = otpExpires;
    await user.save();

    await sendOtpEmail(email, otp, 'FORGOT_PASSWORD');

    return {
        email: user.email,
        message: 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.',
    };
};

const resetPassword = async (email, otp, newPassword) => {
    const user = await User.findOne({ 
        email,
        verificationCode: otp,
        verificationCodeExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Mã xác thực không chính xác hoặc đã hết hạn.');
    }

    user.password = newPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    
    // Đảm bảo account active nếu họ quên pass khi chưa active (hoặc cứ set true cho chắc)
    user.active = true;
    
    await user.save();

    return {
        message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.',
    };
};

module.exports = {
    registerUser,
    authUser,
    verifyOtp,
    forgotPassword,
    resetPassword,
};

