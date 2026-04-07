import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { 
  LockOutlined, 
  SafetyCertificateOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined 
} from "@ant-design/icons";
import { authAPI } from "../../services/api";

export default function ResetPassword() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      form.setFieldsValue({ email });
    }
  }, [searchParams, form]);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      return message.error("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(values.email, values.otp, values.password);
      message.success("Đặt lại mật khẩu thành công!");
      navigate(`/login?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Giao dịch thất bại! Vui lòng thử lại sau.";
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

      {/* Reset Password Card */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 m-4 border border-orange-50">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex flex-col items-center leading-none mb-1 border-l-4 border-orange-500 pl-4">
              <span className="text-3xl font-bold text-gray-800 tracking-tighter logo-font">SPORT GEAR</span>
              <span className="text-sm font-semibold text-gray-400 tracking-[0.4em] ml-0.5">STUDIO</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Đặt lại mật khẩu</h1>
          <p className="text-gray-500 text-sm">Nhập mã OTP từ email và mật khẩu mới của bạn.</p>
        </div>

        <Form
          form={form}
          name="reset_password"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          <Form.Item name="email" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="otp"
            rules={[
              { required: true, message: "Vui lòng nhập mã OTP!" },
              { len: 6, message: "Mã OTP phải có 6 chữ số!" }
            ]}
          >
            <Input 
              prefix={<SafetyCertificateOutlined className="text-gray-400" />} 
              placeholder="Nhập mã OTP (6 số)" 
              className="rounded-xl h-12 border-gray-200 font-mono tracking-widest text-center text-lg"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu mới"
              className="rounded-xl h-12 border-gray-200"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu mới"
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
            >
              Cập nhật mật khẩu
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
