const transporter = require('../config/mail');

const sendOtpEmail = async (email, otp, type = 'REGISTRATION') => {
    let subject = 'Mã xác thực OTP - Sport Gear Studio';
    let title = 'Chào mừng bạn đến với Sport Gear Studio!';
    let message = 'Cảm ơn bạn đã tin tưởng lựa chọn chúng tôi. Để hoàn tất đăng ký tài khoản, vui lòng sử dụng mã OTP dưới đây:';
    let warning = '';

    if (type === 'FORGOT_PASSWORD') {
        subject = 'Đặt lại mật khẩu - Sport Gear Studio';
        title = 'Yêu cầu đặt lại mật khẩu';
        message = 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để tiếp tục:';
        warning = '<p style="color: #666; font-size: 13px; font-style: italic; background: #fff5f5; padding: 10px; border-left: 4px solid #ff4d4f;">Nếu không phải bạn yêu cầu đổi mật khẩu, vui lòng bỏ qua email này và đổi lại mật khẩu của mình ngay lập tức để bảo mật.</p>';
    }

    const mailOptions = {
        from: `"Sport Gear Studio" <${process.env.MAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #ff4d4f; text-align: center;">${title}</h2>
                <p>${message}</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; color: #333; letter-spacing: 5px;">
                    ${otp}
                </div>
                ${warning}
                <p style="margin-top: 20px;">Mã có hiệu lực trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không phản hồi.<br>&copy; 2024 Sport Gear Studio</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Không thể gửi mã OTP qua email.');
    }
};

module.exports = { sendOtpEmail };
