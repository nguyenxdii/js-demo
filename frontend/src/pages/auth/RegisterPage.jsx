import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { authAPI } from "../../services/api";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        address: values.address,
      });

      // Hiển thị thông báo và chuyển hướng đến trang OTP
      message.success("Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
      setTimeout(() => {
        navigate(`/verify-otp?email=${values.email}`);
      }, 1500);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.email ||
        "Đăng ký thất bại";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm transition-all duration-500">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-orange-50">
            <Spin size="large" className="scale-150 custom-orange-spin" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Đang gửi mã xác thực...</h3>
              <p className="text-gray-500 text-sm">Vui lòng không đóng trình duyệt trong giây lát.</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
        <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 m-4 border border-orange-50">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
             <div className="flex flex-col items-center leading-none mb-1 border-l-4 border-orange-500 pl-4">
               <span className="text-3xl font-bold text-gray-800 tracking-tighter logo-font">SPORT GEAR</span>
               <span className="text-sm font-semibold text-gray-400 tracking-[0.4em] ml-0.5">STUDIO</span>
             </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-3 bg-gray-50 px-3 py-1 rounded-full">Hệ thống đồ tập & phụ kiện</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-600 text-sm">Khám phá thế giới đồ tập chuyên nghiệp</p>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          validateTrigger="onSubmit"
          size="large"
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Họ và tên"
              className="rounded-xl h-12 border-gray-200"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Email"
              className="rounded-xl h-12 border-gray-200"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              className="rounded-xl h-12 border-gray-200"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu"
              className="rounded-xl h-12 border-gray-200"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item name="phoneNumber">
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Số điện thoại (tùy chọn)"
              className="rounded-xl h-12 border-gray-200"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-white border-none font-bold rounded-xl shadow-lg shadow-orange-100 transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest text-xs"
              style={{ backgroundColor: "#f57224" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e46113")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f57224")}
            >
              Đăng ký ngay
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
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
