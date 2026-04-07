import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { 
  MailOutlined, 
  ArrowLeftOutlined 
} from "@ant-design/icons";
import { authAPI } from "../../services/api";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(values.email);
      message.success("Mã OTP đã được gửi đến email của bạn!");
      // Chuyển sang trang đặt lại mật khẩu kèm email trên URL
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Gửi yêu cầu thất bại! Vui lòng thử lại sau.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 relative p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Forgot Password Card */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 m-4 border border-orange-50">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex flex-col items-center leading-none mb-1 border-l-4 border-orange-500 pl-4">
              <span className="text-3xl font-bold text-gray-800 tracking-tighter logo-font">SPORT GEAR</span>
              <span className="text-sm font-semibold text-gray-400 tracking-[0.4em] ml-0.5">STUDIO</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Quên mật khẩu?</h1>
          <p className="text-gray-500 text-sm">Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu.</p>
        </div>

        <Form
          name="forgot_password"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="Email của bạn" 
              className="rounded-xl h-12 border-gray-200"
            />
          </Form.Item>

          <Form.Item className="mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-white border-none font-bold rounded-xl shadow-lg shadow-orange-100 transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest text-xs"
              style={{ backgroundColor: "#f57224" }}
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-semibold text-sm"
          >
            <ArrowLeftOutlined className="text-xs" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
