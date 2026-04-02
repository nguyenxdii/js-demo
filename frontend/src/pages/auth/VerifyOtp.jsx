import React, { useState, useEffect } from "react";
import { Card, Typography, Form, Input, Button, message, Space } from "antd";
import { CheckCircleOutlined, MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const VerifyOtp = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) {
            message.error("Thiếu thông tin email để xác thực!");
            navigate("/register");
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8080/api/auth/verify-otp", {
                email,
                otp: values.otp
            });

            if (response.data) {
                message.success("Kích hoạt tài khoản thành công! Vui lòng đăng nhập.");
                
                // Chuyển hướng về trang đăng nhập sau 1.5s
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn!");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        // Logic gửi lại mã (có thể gọi API register lại hoặc endpoint resend riêng)
        message.info("Tính năng gửi lại mã đang được cập nhật!");
        setTimer(60);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
            <Card 
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-[440px] p-10 border-none m-4"
            >
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center mb-4">
                        <div className="flex flex-col items-center leading-none mb-1">
                            <span className="text-2xl font-bold text-primary tracking-tighter logo-font">SPORT GEAR</span>
                            <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em]">STUDIO</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 scale-75">
                        <MailOutlined className="text-2xl text-orange-600" />
                    </div>
                    <Title level={3} className="!mb-2 font-bold uppercase tracking-tight text-gray-800">Xác thực OTP</Title>
                    <Text className="text-gray-400 text-xs">
                        Mã xác thực 6 số đã được gửi đến <br />
                        <Text strong className="text-orange-500 font-bold">{email}</Text>
                    </Text>
                </div>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="otp"
                        rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }, { len: 6, message: "Mã OTP phải có 6 chữ số!" }]}
                        className="mb-8"
                    >
                        <div className="flex justify-center">
                            <Input.OTP 
                                length={6}
                                formatter={(str) => str.toUpperCase()}
                                size="large"
                                className="custom-otp-input"
                            />
                        </div>
                    </Form.Item>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading}
                        className="h-12 rounded-2xl border-none font-bold text-base shadow-lg shadow-orange-100 uppercase tracking-widest transform hover:-translate-y-0.5 transition-all duration-300"
                        style={{
                            backgroundColor: "#f57224",
                            color: "white"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e46113")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f57224")}
                    >
                        XÁC NHẬN MÃ
                    </Button>
                </Form>

                <div className="text-center mt-6">
                    <Text type="secondary" className="text-[13px] font-medium">
                        Không nhận được mã? {timer > 0 ? (
                            <span className="text-gray-400">Gửi lại sau {timer}s</span>
                        ) : (
                            <Button type="link" onClick={handleResend} className="p-0 h-auto text-orange-600 font-bold hover:text-orange-700 text-xs">
                                Gửi lại ngay
                            </Button>
                        )}
                    </Text>
                </div>

                {/* Back to Register Button with Border */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <Link
                        to="/register"
                        className="w-full h-11 flex items-center justify-center gap-2 px-4 border-2 border-gray-200 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 uppercase text-[10px] tracking-[2px]"
                    >
                        <ArrowLeftOutlined className="text-sm" />
                        Quay lại đăng ký
                    </Link>
                </div>
            </Card>

            <div className="fixed bottom-6 text-gray-300 text-[9px] uppercase font-bold tracking-[4px] opacity-40">
                Sport Gear Studio Security Protocol
            </div>

            <style>{`
                .custom-otp-input .ant-input {
                    width: 45px !important;
                    height: 55px !important;
                    border-radius: 12px !important;
                    font-weight: 700 !important;
                    font-size: 22px !important;
                    background: #fbfbfb !important;
                    border: 2px solid #f0f0f0 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    margin: 0 4px !important;
                }
                .custom-otp-input .ant-input:focus {
                    border-color: #f97316 !important;
                    box-shadow: 0 8px 16px -4px rgba(249, 115, 22, 0.2) !important;
                    background: white !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default VerifyOtp;
