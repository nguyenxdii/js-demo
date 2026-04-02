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
      title: "Mã Đơn Hàng", 
      dataIndex: "orderCode", 
      key: "orderCode",
      align: 'center',
      render: (text) => <Text strong className="text-[12px] text-blue-600 uppercase font-mono">{text}</Text>
    },
    { 
      title: "Khách hàng", 
      key: "user",
      ellipsis: true,
      className: "whitespace-nowrap",
      render: (_, record) => record.user?.fullName || <Text type="secondary">Ẩn danh</Text>
    },
    { 
      title: "Số Tiền", 
      dataIndex: "amount", 
      align: 'center',
      render: (amount) => <Text strong className="text-red-600 text-[13px]">{amount?.toLocaleString()} ₫</Text> 
    },
    { 
      title: "Phương thức", 
      dataIndex: "paymentMethod", 
      key: "paymentMethod",
      className: "whitespace-nowrap"
    },
    { 
      title: "Trạng Thái", 
      dataIndex: "status", 
      align: 'center',
      render: (status) => {
        let color = 'orange';
        let text = 'Chờ xử lý';
        if (status === 'PAID') { color = 'green'; text = 'Thành công'; }
        else if (status === 'FAILED') { color = 'red'; text = 'Thất bại'; }
        return <Tag color={color} className="border-none text-[10px] font-bold uppercase">{text}</Tag>;
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
      title={
        <div className="py-1">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 m-0 leading-none">
            Quản Lý Thanh Toán
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 block">
            Theo dõi dòng tiền và lịch sử giao dịch trực tuyến
          </span>
        </div>
      }
      className="shadow-sm border-none rounded-2xl"
      extra={
        <Space>
           <Input 
              placeholder="Mã giao dịch, tên khách..." 
              prefix={<SearchOutlined className="text-gray-400" />} 
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
              className="rounded-lg h-9"
           />
           <Select defaultValue="ALL" style={{ width: 140 }} onChange={val => setStatusFilter(val)} className="rounded-lg h-9">
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
