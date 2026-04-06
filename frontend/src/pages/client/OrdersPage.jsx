import React, { useState, useEffect } from "react";
import { Table, Tag, Typography, Card, Button, message, Space, Empty, Modal, Divider, Spin } from "antd";
import { ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { orderService } from "../../services/orderService";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const getFullImageUrl = (url) => {
    if (!url) return "/images/placeholder.png";
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url.startsWith("/") ? "" : "/"}${url}`;
  };
  const [checkingOrderId, setCheckingOrderId] = useState(null);
  const [cooldowns, setCooldowns] = useState({});

  useEffect(() => {
    fetchOrders();
    // Khôi phục cooldowns từ localStorage nếu cần
    const savedCooldowns = JSON.parse(localStorage.getItem("payment_cooldowns") || "{}");
    const now = Date.now();
    const filtered = {};
    Object.keys(savedCooldowns).forEach(id => {
      if (savedCooldowns[id] > now) filtered[id] = savedCooldowns[id];
    });
    setCooldowns(filtered);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const now = Date.now();
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[id] <= now) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      message.error("Vui lòng đăng nhập để xem đơn hàng!");
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.getUserOrders();
      const sortedOrders = (response.data || []).sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalRefresh = async () => {
    setCheckingOrderId("all");
    
    // Tìm các đơn hàng MoMo đang pending để check status trước
    const pendingMomoOrders = orders.filter(o => o.status === "PENDING" && o.paymentMethod === "MOMO");
    
    try {
      if (pendingMomoOrders.length > 0) {
        message.loading({ content: "Đang kiểm tra trạng thái thanh toán MoMo...", key: "refreshStatus" });
        await Promise.all(pendingMomoOrders.map(o => orderService.checkStatus(o.orderCode).catch(() => null)));
      }
      
      // Load lại toàn bộ danh sách
      await fetchOrders();
      if (pendingMomoOrders.length > 0) {
         message.success({ content: "Đã cập nhật trạng thái các đơn hàng!", key: "refreshStatus", duration: 2 });
      } else {
         message.success("Đã làm mới danh sách đơn hàng");
      }
    } catch (error) {
      message.error({ content: "Có lỗi khi tải lại đơn hàng", key: "refreshStatus" });
    } finally {
      setCheckingOrderId(null);
    }
  };

  const handleViewDetail = async (orderId) => {
    setDetailLoading(true);
    setIsDetailModalVisible(true);
    try {
      const response = await orderService.getOrderById(orderId);
      setSelectedOrder(response.data);
    } catch (error) {
      message.error("Không thể tải chi tiết đơn hàng!");
      setIsDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSingleCheck = async (record) => {
    setCheckingOrderId(record._id);
    try {
      message.loading({ content: `Đang kiểm tra đơn ${record.orderCode}...`, key: "checkOne" });
      await orderService.checkStatus(record.orderCode);
      await fetchOrders();
      message.success({ content: "Đã cập nhật trạng thái!", key: "checkOne", duration: 2 });
    } catch (error) {
      message.error({ content: "Không thể cập nhật trạng thái lúc này", key: "checkOne" });
    } finally {
      setCheckingOrderId(null);
    }
  };

  const getStatusTag = (record) => {
    const status = record.status;
    switch (status) {
      case "PENDING":
        return (
          <Space direction="vertical" size={4}>
            <Tag icon={<ClockCircleOutlined />} color="warning">Chờ thanh toán</Tag>
            <Button 
              size="small" 
              type="primary" 
              ghost 
              icon={<SyncOutlined spin={checkingOrderId === record._id} />} 
              className="text-[10px] h-6 px-2 rounded-md"
              onClick={() => handleSingleCheck(record)}
              loading={checkingOrderId === record._id}
            >
              Kiểm tra ngay
            </Button>
          </Space>
        );
      case "PAID":
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã thanh toán</Tag>;
      case "PROCESSING":
        return <Tag icon={<CheckCircleOutlined />} color="success">Đang xử lý</Tag>;
      case "SHIPPED":
        return <Tag icon={<SyncOutlined spin />} color="geekblue">Đang giao hàng</Tag>;
      case "DELIVERED":
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã giao hàng</Tag>;
      case "CANCELLED":
        return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <Text strong className="text-primary">{text}</Text>,
    },
    {
      title: "Ngày Đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN", {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (price) => (
        <Text strong className="text-red-600">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0)}
        </Text>
      ),
    },
    {
      title: "Trạng Thái",
      key: "status",
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Thao Tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record._id)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="!mb-1">Đơn hàng của bạn</Title>
            <Text type="secondary">Theo dõi trạng thái và lịch sử mua sắm của bạn.</Text>
          </div>
          <Button 
            onClick={handleGlobalRefresh} 
            loading={checkingOrderId === "all" || loading}
            icon={<ReloadOutlined />} 
            type="primary"
            ghost
            className="flex items-center rounded-xl font-semibold border-gray-300 text-gray-700 hover:text-orange-500 hover:border-orange-500 transition-colors"
          >
            Tải lại đơn hàng
          </Button>
        </div>

        <Card className="rounded-3xl shadow-sm border-none overflow-hidden">
          {orders.length > 0 ? (
            <Table 
              columns={columns} 
              dataSource={orders} 
              rowKey="_id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              className="orders-table"
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-4">
                  <Text type="secondary">Bạn chưa có đơn hàng nào.</Text>
                  <br />
                  <Link to="/">
                    <Button type="primary" size="large" className="rounded-xl mt-4">
                      MUA SẮM NGAY
                    </Button>
                  </Link>
                </div>
              }
            />
          )}
        </Card>

        <Modal
          title={<Title level={4}>Chi tiết đơn hàng {selectedOrder?.orderCode}</Title>}
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>
          ]}
          width={800}
        >
          {detailLoading ? (
            <div className="py-20 text-center"><Spin size="large" /></div>
          ) : selectedOrder ? (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <Text type="secondary" className="block mb-1 uppercase text-xs font-bold tracking-wider">Thông tin giao hàng</Text>
                  <Text strong className="block">{selectedOrder.fullName}</Text>
                  <Text className="block text-xs text-gray-500">{selectedOrder.phoneNumber}</Text>
                  <Text className="block text-xs text-gray-500">{selectedOrder.address}</Text>
                </div>
                <div>
                  <Text type="secondary" className="block mb-1 uppercase text-xs font-bold tracking-wider">Trạng thái & Thanh toán</Text>
                  <div className="mb-2">{getStatusTag(selectedOrder)}</div>
                  <Text className="block text-xs text-gray-500">Phương thức: <Tag color="orange" size="small">{selectedOrder.paymentMethod}</Tag></Text>
                  <Text className="block text-xs text-gray-500">Thanh toán: <Tag color={selectedOrder.paymentStatus === 'PAID' ? 'green' : 'red'}>{selectedOrder.paymentStatus}</Tag></Text>
                </div>
              </div>

              <Divider className="!my-0">Danh sách sản phẩm</Divider>

              <Table
                dataSource={selectedOrder.items}
                rowKey="_id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Sản phẩm',
                    dataIndex: 'product',
                    key: 'product',
                    render: (product, record) => {
                      const productName = product?.name || record.name || 'Sản phẩm';
                      const productImage = getFullImageUrl(product?.mainImageUrl || record.image);
                      return (
                        <Space>
                          <img src={productImage} alt={productName} className="w-10 h-10 object-contain rounded border" />
                          <Text strong className="text-xs">{productName}</Text>
                        </Space>
                      );
                    }
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center',
                    width: 80,
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'price',
                    key: 'price',
                    align: 'right',
                    render: (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
                  },
                  {
                    title: 'Thành tiền',
                    key: 'subtotal',
                    align: 'right',
                    render: (_, record) => (
                      <Text strong className="text-xs">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.price * record.quantity)}
                      </Text>
                    )
                  },
                ]}
              />

              <div className="text-right space-y-1 pr-4 pt-4 border-t">
                <div>
                  <Text type="secondary" className="text-xs">Tổng tiền hàng: </Text>
                  <Text strong className="text-xs">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format((selectedOrder.totalAmount || 0) - (selectedOrder.shippingFee || 0))}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Phí vận chuyển: </Text>
                  <Text strong className="text-xs">
                    {(selectedOrder.shippingFee || 0) === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.shippingFee)}
                  </Text>
                </div>
                <div className="pt-2">
                  <Text className="text-md">Tổng thanh toán: </Text>
                  <Text className="text-lg font-black text-red-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.totalAmount)}
                  </Text>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>

      <style jsx>{`
        .orders-table :global(.ant-table-thead > tr > th) {
          background: #fafafa;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
