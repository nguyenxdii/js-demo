import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Form, Input, Button, message, Space } from "antd";
import { 
  MailOutlined, 
  LockOutlined, 
  ArrowLeftOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from "@ant-design/icons";
import { authAPI } from "../../services/api";

export default function LoginPage() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pre-fill email from URL query param
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      form.setFieldsValue({ email: emailParam });
    }
  }, [searchParams, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.email, values.password);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Thông báo cho CartContext biết user đã login để fetch giỏ hàng
      window.dispatchEvent(new Event("user-login"));

      message.success("Đăng nhập thành công!");
      
      // Role-based redirect
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Đăng nhập thất bại! Vui lòng kiểm tra lại email và mật khẩu.";
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

      {/* Login Card */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 m-4 border border-orange-50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex flex-col items-center leading-none mb-1 border-l-4 border-orange-500 pl-4">
              <span className="text-3xl font-bold text-gray-800 tracking-tighter logo-font">SPORT GEAR</span>
              <span className="text-sm font-semibold text-gray-400 tracking-[0.4em] ml-0.5">STUDIO</span>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-3 bg-gray-50 px-3 py-1 rounded-full">Hệ thống đồ tập & phụ kiện</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h1>
          <p className="text-gray-500 text-sm">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="login"
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

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              className="rounded-xl h-12 border-gray-200"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item className="mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-white border-none font-bold rounded-xl shadow-lg shadow-orange-100 transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest text-xs"
              style={{ backgroundColor: "#f57224" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e46113")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f57224")}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="px-4 bg-white text-gray-400 font-medium">Hoặc</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full h-11 flex items-center justify-center gap-2 px-4 border-2 border-gray-100 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 text-sm"
          >
            <ArrowLeftOutlined className="text-xs" />
            Quay lại trang chủ
          </Link>

          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
