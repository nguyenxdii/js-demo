import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Button, message, Space, Card, Modal, Select, Typography, Input } from "antd";
import { EyeOutlined, SyncOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SearchOutlined } from "@ant-design/icons";
import axiosInstance from "../../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/orders/admin/all");
      const sortedData = (response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderCode?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.user?.fullName?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      message.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING": return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ thanh toán</Tag>;
      case "PAID": return <Tag icon={<CheckCircleOutlined />} color="success">Đã thanh toán</Tag>;
      case "PROCESSING": return <Tag icon={<CheckCircleOutlined />} color="processing">Đang xử lý</Tag>;
      case "SHIPPED": return <Tag icon={<SyncOutlined spin />} color="geekblue">Đang giao hàng</Tag>;
      case "DELIVERED": return <Tag icon={<CheckCircleOutlined />} color="success">Đã giao hàng</Tag>;
      case "CANCELLED": return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    { 
      title: "Mã đơn", 
      dataIndex: "orderCode", 
      key: "orderCode",
      width: '12%',
      align: 'center',
      render: (text) => (
        <Text copyable={{ tooltips: false }} ellipsis={{ tooltip: text }} className="font-mono text-[12px] text-slate-500">
          {text}
        </Text>
      )
    },
    { 
      title: "Khách hàng", 
      key: "user",
      width: '18%',
      align: 'center',
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <Text ellipsis={{ tooltip: record.user?.fullName }} className="text-[13px] font-medium block text-center max-w-[150px]">
            {record.user?.fullName || "Ẩn danh"}
          </Text>
        </div>
      )
    },
    { 
      title: "Tổng tiền", 
      dataIndex: "totalAmount", 
      width: '12%',
      align: 'center',
      render: (price) => (
        <Text strong className="text-slate-700 text-[13px]">
          {price?.toLocaleString()}₫
        </Text>
      )
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status",
      width: '15%',
      align: 'center',
      render: (status) => {
        const statuses = {
          PENDING: { color: 'orange', text: 'Chờ thanh toán' },
          PAID: { color: 'green', text: 'Đã thanh toán' },
          PROCESSING: { color: 'blue', text: 'Đang xử lý' },
          SHIPPED: { color: 'cyan', text: 'Đang giao' },
          DELIVERED: { color: 'green', text: 'Đã giao' },
          CANCELLED: { color: 'red', text: 'Đã hủy' }
        };
        const s = statuses[status] || { color: 'default', text: status };
        return <Tag color={s.color} className="text-[10px] font-bold m-0 border-none px-2">{s.text}</Tag>;
      }
    },
    {
      title: "Cập nhật",
      key: "update",
      width: '18%',
      align: 'center',
      render: (_, record) => (
        <Select 
          value={record.status} 
          style={{ width: '100%' }} 
          onChange={(val) => handleStatusChange(record._id || record.id, val)}
          size="small"
          className="text-[11px]"
        >
          <Option value="PENDING">Chờ thanh toán</Option>
          <Option value="PAID">Đã thanh toán</Option>
          <Option value="PROCESSING">Đang xử lý</Option>
          <Option value="SHIPPED">Đang giao hàng</Option>
          <Option value="DELIVERED">Đã giao hàng</Option>
          <Option value="CANCELLED">Hủy đơn</Option>
        </Select>
      )
    },
    {
      title: "Xem",
      key: "action",
      width: '6%',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="text"
          icon={<EyeOutlined className="text-blue-500" />} 
          size="small"
          onClick={() => { setSelectedOrder(record); setIsModalVisible(true); }}
        />
      )
    }
  ];

  return (
    <Card 
      title={
        <div className="py-1">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 m-0 leading-none">
            Quản Lý Đơn Hàng
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 block">
            Theo dõi và cập nhật trạng thái đơn hàng từ khách hàng
          </span>
        </div>
      }
      extra={
        <Space size="middle">
           <Input 
              placeholder="Tìm mã đơn, tên khách..." 
              prefix={<SearchOutlined className="text-gray-400" />} 
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
              className="rounded-lg h-9 shadow-sm"
           />
           <Select 
              defaultValue="ALL" 
              style={{ width: 160 }}
              onChange={val => setStatusFilter(val)}
              className="rounded-lg h-9 shadow-sm"
           >
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PENDING">Chờ thanh toán</Option>
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="PROCESSING">Đang xử lý</Option>
              <Option value="SHIPPED">Đang giao hàng</Option>
              <Option value="DELIVERED">Đã giao hàng</Option>
              <Option value="CANCELLED">Đã hủy</Option>
           </Select>
        </Space>
      }
      className="shadow-sm border-none rounded-2xl"
    >
      <Table 
        columns={columns} 
        dataSource={filteredOrders} 
        rowKey="_id" 
        loading={loading} 
        size="middle"
        className="sgs-admin-table"
      />
      
      <Modal 
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div><Text type="secondary">Mã đơn:</Text> <Text strong>{selectedOrder.orderCode}</Text></div>
                <div><Text type="secondary">Ngày đặt:</Text> <Text strong>{new Date(selectedOrder.createdAt).toLocaleString()}</Text></div>
                <div><Text type="secondary">Điện thoại:</Text> <Text strong>{selectedOrder.phoneNumber}</Text></div>
                <div><Text type="secondary">Địa chỉ:</Text> <Text strong>{selectedOrder.address}</Text></div>
                {selectedOrder.voucher && (
                  <div>
                    <Text type="secondary">Mã giảm giá:</Text> <Tag color="green" className="font-bold ml-1">{selectedOrder.voucher.code}</Tag>
                  </div>
                )}
                <div>
                   <Text type="secondary">Phí vận chuyển:</Text> <Text strong>{selectedOrder.shippingFee === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.shippingFee)}</Text>
                </div>
             </div>
              <Table 
                dataSource={selectedOrder.items} 
                rowKey="_id"
                pagination={false} 
                size="small"
                columns={[
                    { 
                      title: "Sản phẩm", 
                      key: "prod_details", 
                      render: (item) => (
                        <div className="flex items-center gap-2">
                          {item.productImage && (
                            <img 
                              src={item.productImage.startsWith('http') ? item.productImage : `http://localhost:8080${item.productImage}`} 
                              alt={item.productName} 
                              className="w-10 h-10 object-cover rounded shadow-sm"
                            />
                          )}
                          <Text className="text-[13px]">{item.productName || item.name || item.product?.name || "Sản phẩm đã xóa"}</Text>
                        </div>
                      ) 
                    },
                    { title: "SL", dataIndex: "quantity", width: 50, align: 'center' },
                    { title: "Giá", dataIndex: "price", align: 'right', render: (p) => <Text strong>{p?.toLocaleString()}₫</Text> }
                ]}
              />
              
              <div className="border-t pt-3 flex flex-col items-end space-y-1">
                 <div className="flex justify-between w-64 text-[13px]">
                    <Text type="secondary">Tạm tính:</Text>
                    <Text>{(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0) + (selectedOrder.discountAmount || 0))?.toLocaleString()}₫</Text>
                 </div>
                 {selectedOrder.discountAmount > 0 && (
                   <div className="flex justify-between w-64 text-[13px]">
                      <Text type="secondary">Giảm giá:</Text>
                      <Text className="text-red-500">-{selectedOrder.discountAmount?.toLocaleString()}₫</Text>
                   </div>
                 )}
                 <div className="flex justify-between w-64 text-[13px]">
                    <Text type="secondary">Phí vận chuyển:</Text>
                    <Text>{selectedOrder.shippingFee === 0 ? "Miễn phí" : `${selectedOrder.shippingFee?.toLocaleString()}₫`}</Text>
                 </div>
                 <div className="flex justify-between w-64 pt-2 border-t mt-1">
                    <Text strong className="text-lg">Tổng thanh toán:</Text>
                    <Text strong className="text-xl text-blue-600">{selectedOrder.totalAmount?.toLocaleString()}₫</Text>
                 </div>
              </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default OrderManagement;
