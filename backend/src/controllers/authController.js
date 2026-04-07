const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.authUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401);
        return next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword(email, otp, newPassword);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

const logout = async (req, res) => {
    res.status(200).json({ message: 'Đăng xuất thành công' });
};

module.exports = {
    register,
    login,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
};

