import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Card, message, Typography, Input, Select, Space } from "antd";
import { CreditCardOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import axiosInstance from "../../../services/api";

const { Text } = Typography;
const { Option } = Select;

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/orders/admin/all");
      const paymentData = (response.data || [])
        .filter(o => o.paymentMethod === 'MOMO')
        .map(o => ({
          id: o._id,
          transactionId: o.transId || "N/A",
          amount: o.totalAmount,
          status: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          createdAt: o.updatedAt, // Ngày cập nhật cuối cùng thường là ngày thanh toán
          orderCode: o.orderCode,
          user: o.user
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(paymentData);
    } catch (error) {
      message.error("Lỗi khi tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const name = payment.user?.fullName || "";
      const matchesSearch = 
        payment.transactionId?.toLowerCase().includes(searchText.toLowerCase()) ||
        name.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchText, statusFilter]);

  const columns = [
    { 
      title: "Mã đơn hàng", 
      dataIndex: "orderCode", 
      key: "orderCode",
      ellipsis: true,
      className: "whitespace-nowrap font-bold text-primary"
    },
    { 
      title: "Khách hàng", 
      key: "user",
      ellipsis: true,
      className: "whitespace-nowrap",
      render: (_, record) => record.user?.fullName || <Text type="secondary">Ẩn danh</Text>
    },
    { 
      title: "Số tiền", 
      dataIndex: "amount", 
      className: "whitespace-nowrap font-bold text-red-600",
      render: (amount) => `${amount ? amount.toLocaleString() : 0} ₫` 
    },
    { 
      title: "Phương thức", 
      dataIndex: "paymentMethod", 
      key: "paymentMethod",
      className: "whitespace-nowrap"
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      className: "whitespace-nowrap",
      render: (status) => {
        let color = 'warning';
        let text = 'Chờ thanh toán';
        let icon = <ClockCircleOutlined />;

        if (status === 'PAID') {
          color = 'success';
          text = 'Thành công';
          icon = <CheckCircleOutlined />;
        } else if (status === 'FAILED') {
          color = 'error';
          text = 'Thất bại';
          icon = <CloseCircleOutlined />;
        }

        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        );
      }
    },
    { 
      title: "Ngày thanh toán", 
      dataIndex: "createdAt", 
      className: "whitespace-nowrap",
      render: (date) => (
        <div className="text-xs">
          <div>{new Date(date).toLocaleTimeString('vi-VN')}</div>
          <div className="text-gray-400">{new Date(date).toLocaleDateString('vi-VN')}</div>
        </div>
      )
    }
  ];

  return (
    <Card 
      title={<div className="font-bold text-lg">Quản lý Giao dịch / Thanh toán</div>} 
      className="shadow-sm border-none rounded-2xl"
      extra={
        <Space>
           <Input 
              placeholder="Mã giao dịch, tên khách..." 
              prefix={<SearchOutlined />} 
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
           />
           <Select defaultValue="ALL" style={{ width: 150 }} onChange={val => setStatusFilter(val)}>
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="SUCCESS">Thành công</Option>
              <Option value="PENDING">Đang xử lý</Option>
           </Select>
        </Space>
      }
    >
      <Table columns={columns} dataSource={filteredPayments} rowKey="id" loading={loading} />
    </Card>
  );
};

export default PaymentManagement;
