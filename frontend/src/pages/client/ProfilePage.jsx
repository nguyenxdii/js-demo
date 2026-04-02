import React, { useState, useEffect } from "react";
import { 
  Card, Typography, Form, Input, Button, Upload, message, 
  Divider, Row, Col, Avatar, Badge, Tag, Modal, Spin, Tabs, List
} from "antd";
import { 
  SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined, 
  HomeOutlined, CameraOutlined, LockOutlined, EditOutlined,
  CheckCircleOutlined, ThunderboltOutlined, CalendarOutlined,
  DollarOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import { userAPI } from "../../services/api";
import axiosInstance from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Avatar states
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Edit states
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    
    // Password / OTP states
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [pendingNewPassword, setPendingNewPassword] = useState("");
    const [otpValue, setOtpValue] = useState("");

    const [infoForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("blob:") || url.startsWith("http")) return url;
        const cleanUrl = url.replace(/\\/g, '/');
        return `http://localhost:8080${cleanUrl.startsWith("/") ? cleanUrl : "/" + cleanUrl}`;
    };

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            infoForm.setFieldsValue(parsedUser);
            setPreviewAvatar(getFullImageUrl(parsedUser.avatarUrl));
        } else {
            navigate("/login");
        }
    }, [infoForm, navigate]);

    // ---- THÔNG TIN CÁ NHÂN & AVATAR ----
    const onSaveInfo = async (values) => {
        setLoading(true);
        try {
            const currentUserId = user._id || user.id;
            const response = await userAPI.updateProfile(currentUserId, values);
            const updatedUser = { ...user, ...response.data };
            
            if (avatarFile) {
                const formData = new FormData();
                formData.append("image", avatarFile);
                const avatarResponse = await axiosInstance.post(`/users/${currentUserId}/avatar`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Object.assign(updatedUser, avatarResponse.data);
            }

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setPreviewAvatar(getFullImageUrl(updatedUser.avatarUrl));
            setIsEditingInfo(false);
            setAvatarFile(null);
            message.success("Cập nhật thông tin thành công!");
        } catch (error) {
            message.error(error.response?.data?.message || "Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (info) => {
        if (info.file) {
            setAvatarFile(info.file);
            setPreviewAvatar(URL.createObjectURL(info.file));
            
            if (!isEditingInfo) {
                setIsEditingInfo(true);
            }
        }
    };

    // ---- ĐỔI MẬT KHẨU ----
    const onRequestPasswordChange = async (values) => {
        setPasswordLoading(true);
        try {
            const currentUserId = user._id || user.id;
            await axiosInstance.post(`/users/${currentUserId}/request-password-otp`, {
                currentPassword: values.currentPassword
            });
            setPendingNewPassword(values.newPassword);
            setOtpModalVisible(true);
            message.success("Mã xác nhận (OTP) đã được gửi đến email của bạn.");
        } catch (error) {
            message.error(error.response?.data?.message || "Mật khẩu hiện tại không đúng!");
        } finally {
            setPasswordLoading(false);
        }
    };

    const confirmPasswordChange = async () => {
        if (!otpValue || otpValue.length !== 6) {
            message.warning("Vui lòng nhập đủ 6 số OTP");
            return;
        }
        setOtpLoading(true);
        try {
            const currentUserId = user._id || user.id;
            await axiosInstance.post(`/users/${currentUserId}/confirm-password-change`, {
                otp: otpValue,
                newPassword: pendingNewPassword
            });
            message.success("Đổi mật khẩu thành công!");
            setOtpModalVisible(false);
            setIsEditingPassword(false);
            passwordForm.resetFields();
            setOtpValue("");
            setPendingNewPassword("");
        } catch (error) {
            message.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!");
        } finally {
            setOtpLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <Title level={2} className="!mb-12 font-bold uppercase tracking-tight text-gray-800 text-center">Thông tin cá nhân</Title>

                <Row gutter={32}>
                    <Col xs={24} md={8}>
                        <Card className="rounded-[40px] shadow-sm border-none text-center p-8 mb-6 sticky top-24">
                            <div className="relative inline-block group">
                                <Avatar 
                                    size={180} 
                                    src={previewAvatar} 
                                    icon={<UserOutlined />} 
                                    className="border-8 border-orange-50 shadow-2xl object-cover"
                                />
                                <Upload 
                                    showUploadList={false} 
                                    beforeUpload={() => false}
                                    onChange={handleAvatarChange}
                                    disabled={!isEditingInfo}
                                >
                                    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity ${isEditingInfo ? 'opacity-0 group-hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}>
                                        <CameraOutlined className="text-white text-3xl" />
                                    </div>
                                </Upload>
                            </div>
                            
                            <div className="mt-8">
                                <Title level={3} className="!mb-2 font-bold">{user.fullName}</Title>
                                <Tag color="orange" className="rounded-full px-6 py-1 border-none font-bold uppercase text-[10px] tracking-widest">
                                    {user.role}
                                </Tag>
                            </div>

                            <Divider className="my-8 border-gray-100" />
                            
                            <div className="text-left space-y-6">
                                <div className="flex flex-col gap-1">
                                    <Text className="text-[9px] font-bold uppercase text-gray-300 tracking-widest">Email liên hệ</Text>
                                    <div className="flex items-center gap-3">
                                        <MailOutlined className="text-orange-500" />
                                        <Text className="text-sm font-bold text-gray-700 truncate">{user.email}</Text>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Text className="text-[9px] font-bold uppercase text-gray-300 tracking-widest">Số điện thoại</Text>
                                    <div className="flex items-center gap-3">
                                        <PhoneOutlined className="text-orange-500" />
                                        <Text className="text-sm font-bold text-gray-700">{user.phoneNumber || "Chưa cập nhật"}</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={16}>
                        <Card className="rounded-[32px] shadow-sm border-none overflow-hidden mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <Title level={4} className="!m-0 font-bold text-xs uppercase text-gray-400 tracking-widest">
                                    <UserOutlined className="mr-2"/> Cập nhật thông tin
                                </Title>
                                {!isEditingInfo ? (
                                    <Button type="primary" ghost icon={<EditOutlined />} onClick={() => setIsEditingInfo(true)} className="rounded-lg font-semibold border-primary text-primary">
                                        Sửa thông tin
                                    </Button>
                                ) : (
                                    <Button type="text" onClick={() => { setIsEditingInfo(false); infoForm.resetFields(); }} className="text-gray-500 font-semibold">Hủy</Button>
                                )}
                            </div>

                            <Form 
                                form={infoForm} 
                                layout="vertical" 
                                onFinish={onSaveInfo}
                                disabled={!isEditingInfo}
                            >
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true }]}>
                                            <Input prefix={<UserOutlined className="text-gray-400"/>} className={`h-12 rounded-2xl ${isEditingInfo ? 'bg-white' : 'bg-gray-50 border-transparent'} border-gray-200`} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Email (Không thể thay đổi)" name="email">
                                            <Input disabled prefix={<MailOutlined className="text-gray-400"/>} className="h-12 rounded-2xl opacity-60 bg-gray-50 border-transparent" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Số điện thoại" name="phoneNumber">
                                            <Input prefix={<PhoneOutlined className="text-gray-400"/>} className={`h-12 rounded-2xl ${isEditingInfo ? 'bg-white' : 'bg-gray-50 border-transparent'} border-gray-200`} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Địa chỉ giao hàng mặc định" name="address">
                                            <Input.TextArea rows={3} className={`rounded-2xl p-4 ${isEditingInfo ? 'bg-white' : 'bg-gray-50 border-transparent'} border-gray-200`} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {isEditingInfo && (
                                    <div className="mt-4 flex justify-end">
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                            className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 border-none font-bold shadow-lg shadow-orange-100"
                                        >
                                            LƯU THÔNG TIN
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </Card>

                        <Card className="rounded-[32px] shadow-sm border-none overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <Title level={4} className="!m-0 font-bold text-xs uppercase text-gray-400 tracking-widest">
                                    <LockOutlined className="mr-2"/> Bảo mật & Mật khẩu
                                </Title>
                                {!isEditingPassword ? (
                                    <Button type="default" icon={<EditOutlined />} onClick={() => setIsEditingPassword(true)} className="rounded-lg font-semibold">
                                        Đổi mật khẩu
                                    </Button>
                                ) : (
                                    <Button type="text" onClick={() => { setIsEditingPassword(false); passwordForm.resetFields(); }} className="text-gray-500 font-semibold">Hủy</Button>
                                )}
                            </div>

                            {isEditingPassword ? (
                                <Form 
                                    form={passwordForm} 
                                    layout="vertical" 
                                    onFinish={onRequestPasswordChange}
                                >
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}>
                                                <Input.Password prefix={<LockOutlined className="text-gray-400"/>} className="h-12 rounded-2xl bg-white border-gray-200" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Mật khẩu mới (Tối thiểu 6 ký tự)" name="newPassword" rules={[{ required: true, min: 6, message: "Nhập mật khẩu mới hợp lệ" }]}>
                                                <Input.Password prefix={<LockOutlined className="text-gray-400"/>} className="h-12 rounded-2xl bg-white border-gray-200" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <div className="mt-2 flex justify-end">
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={passwordLoading}
                                            icon={<CheckCircleOutlined />}
                                            className="h-12 px-8 rounded-xl bg-gray-900 border-none font-bold shadow-lg hover:bg-gray-800"
                                        >
                                            XÁC NHẬN ĐỔI MẬT KHẨU
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-500">
                                    <LockOutlined className="mr-2" /> Mật khẩu của bạn được bảo mật bởi hệ thống Sport Gear Studio.
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Modal Nhập mã OTP */}
            <Modal
                title="Xác minh bảo mật (OTP)"
                open={otpModalVisible}
                onCancel={() => setOtpModalVisible(false)}
                footer={null}
                centered
            >
                <div className="text-center py-6">
                    <MailOutlined className="text-5xl text-orange-500 mb-4" />
                    <Title level={4}>Kiểm tra Email của bạn</Title>
                    <Text className="block text-gray-500 mb-6">
                        Chúng tôi đã gửi một mã xác minh gồm 6 chữ số đến email <b>{user?.email}</b>. 
                        Bạn hãy nhập mã này để tạo mật khẩu mới.
                    </Text>
                    
                    <Input 
                        size="large" 
                        placeholder="Nhập 6 số OTP" 
                        maxLength={6}
                        className="text-center text-2xl font-bold tracking-widest h-14 w-48 mb-6 bg-gray-50 rounded-xl"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                    />
                    
                    <Button 
                        type="primary" 
                        className="w-full h-12 bg-orange-500 border-none font-bold rounded-xl shadow-lg"
                        loading={otpLoading}
                        onClick={confirmPasswordChange}
                    >
                        HOÀN TẤT ĐỔI MẬT KHẨU
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;
