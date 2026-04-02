import React, { useState, useEffect } from "react";
import { 
  Card, Typography, Button, message, 
  Divider, Row, Col, Tag, Spin, List, Empty, Modal
} from "antd";
import { 
  ThunderboltOutlined, CalendarOutlined,
  DollarOutlined, ArrowRightOutlined, DeleteOutlined, 
  LeftOutlined, BuildOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";
import axiosInstance from "../../services/api";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { confirm } = Modal;

const SavedBuildsPage = () => {
    const [user, setUser] = useState(null);
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchSavedBuilds(parsedUser.id);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchSavedBuilds = async (userId) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/build-pc/my-builds/${userId}`);
            setSavedBuilds(response.data);
        } catch (error) {
            console.error("Error fetching saved builds:", error);
            message.error("Không thể tải danh sách cấu hình.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBuild = (id) => {
        confirm({
            title: 'Xóa cấu hình này?',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa cấu hình PC này? Hành động này không thể hoàn tác.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    await axiosInstance.delete(`/build-pc/${id}`);
                    message.success("Xóa cấu hình thành công!");
                    setSavedBuilds(prev => prev.filter(b => b.id !== id));
                } catch (error) {
                    console.error("Error deleting build:", error);
                    message.error("Xóa thất bại!");
                }
            }
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price || 0);
    };

    if (!user) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-4 mb-8">
                   <Button 
                     icon={<LeftOutlined />} 
                     onClick={() => navigate(-1)}
                     className="rounded-xl border-none shadow-sm hover:text-primary"
                   >
                     Quay lại
                   </Button>
                   <Title level={2} className="!m-0 font-black uppercase tracking-tight text-gray-800">Cấu hình PC của tôi</Title>
                </div>

                <div className="mb-10 text-center bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                    <BuildOutlined className="text-5xl text-orange-500 mb-4" />
                    <Title level={4} className="!mb-1 font-black">Khám phá lại các tác phẩm của bạn</Title>
                    <Text className="text-gray-400">Xem lại, quản lý và tiếp tục xây dựng các bộ máy tính mơ ước.</Text>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Spin size="large" /></div>
                ) : savedBuilds.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {savedBuilds.map((build) => (
                            <Col xs={24} key={build.id}>
                                <Card className="group bg-white border border-gray-100 hover:border-orange-200 p-0 rounded-[32px] overflow-hidden transition-all hover:shadow-2xl hover:shadow-orange-500/5">
                                    <div className="flex flex-col md:flex-row justify-between items-stretch">
                                        <div className="p-8 flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CalendarOutlined className="text-gray-300 text-xs" />
                                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Đã lưu: {new Date(build.createdAt).toLocaleDateString("vi-VN")}
                                                </Text>
                                            </div>
                                            <Title level={3} className="!mb-3 font-black group-hover:text-orange-500 transition-colors !text-xl">
                                                {build.name}
                                            </Title>
                                            <div className="flex items-center gap-6 mt-6">
                                                <div className="flex flex-col">
                                                    <Text className="text-[9px] font-black uppercase text-gray-300 tracking-widest mb-1">Tổng giá trị</Text>
                                                    <Tag color="orange" className="rounded-xl border-none font-black px-4 py-1 text-base m-0">
                                                        {formatPrice(build.totalPrice)}
                                                    </Tag>
                                                </div>
                                                <div className="flex flex-col">
                                                    <Text className="text-[9px] font-black uppercase text-gray-300 tracking-widest mb-1">Thành phần</Text>
                                                    <Text className="text-gray-700 font-bold ml-1">
                                                        {build.items?.length || 0} Linh kiện
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 md:w-48 flex flex-col justify-center gap-3 p-6 border-l border-gray-100">
                                            <Button 
                                                type="primary"
                                                icon={<ArrowRightOutlined />} 
                                                className="h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 border-none font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-100"
                                                onClick={() => navigate('/build-pc', { state: { buildId: build.id } })}
                                            >
                                                MỞ LẠI
                                            </Button>
                                            <Button 
                                                danger 
                                                icon={<DeleteOutlined />} 
                                                className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest border-none hover:bg-red-50"
                                                onClick={() => handleDeleteBuild(build.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Card className="rounded-[40px] py-20 text-center shadow-sm border-none">
                        <Empty 
                          description={
                            <div className="mt-4">
                                <Text className="text-gray-400 font-bold block mb-4">Bạn chưa có cấu hình PC nào được lưu.</Text>
                                <Button 
                                  type="primary" 
                                  size="large" 
                                  onClick={() => navigate('/build-pc')}
                                  className="rounded-2xl h-14 px-10 bg-gray-900 border-none font-bold shadow-xl"
                                >
                                  BẮT ĐẦU XÂY DỰNG NGAY
                                </Button>
                            </div>
                          } 
                        />
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SavedBuildsPage;
