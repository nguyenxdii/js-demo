import React, { useState, useEffect } from "react";
import { Table, Tag, Button, message, Space, Card, Modal, Form, Input, Select, DatePicker, InputNumber, Typography, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from "@ant-design/icons";
import axiosInstance from "../../../services/api";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [form] = Form.useForm();

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/vouchers?all=true");
            const data = response.data.map(v => ({
                ...v, 
                // Map backend fields to frontend fields for consistency
                value: v.discountPercentage || v.discountAmount || 0,
                type: v.type || (v.discountPercentage > 0 ? 'PERCENT' : 'FIXED'),
                isActive: v.active !== undefined ? v.active : v.isActive,
                expirationDate: v.endDate || v.expirationDate,
            }));
            setVouchers(data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách voucher");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleAddEdit = (voucher = null) => {
        setEditingVoucher(voucher);
        if (voucher) {
            form.setFieldsValue({
                ...voucher,
                startDate: voucher.startDate ? dayjs(voucher.startDate) : null,
                expirationDate: voucher.expirationDate ? dayjs(voucher.expirationDate) : null,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ isActive: true, type: "PERCENT" });
        }
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        if (!id) return;
        try {
            await axiosInstance.delete(`/vouchers/${id}`);
            message.success("Xóa voucher thành công");
            fetchVouchers();
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi xóa voucher");
        }
    };

    const isFreeShip = Form.useWatch("isFreeShip", form);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                isFreeShip: values.isFreeShip || false,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                expirationDate: values.expirationDate ? values.expirationDate.toISOString() : null,
            };

            if (editingVoucher) {
                await axiosInstance.put(`/vouchers/${editingVoucher._id}`, payload);
                message.success("Cập nhật voucher thành công");
            } else {
                await axiosInstance.post("/vouchers", payload);
                message.success("Thêm mới voucher thành công");
            }
            setIsModalVisible(false);
            fetchVouchers();
        } catch (error) {
            message.error("Lỗi khi lưu voucher");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            title: "Mã Code", 
            dataIndex: "code", 
            key: "code",
            align: 'center',
            render: (code) => <Tag color="gold" className="font-bold border-none px-3 rounded-md text-[11px] uppercase tracking-wider">{code}</Tag>
        },
        { 
            title: "Loại Voucher", 
            dataIndex: "isFreeShip", 
            align: 'center',
            render: (freeShip, record) => freeShip ? <Tag color="blue" className="border-none text-[10px] uppercase font-bold">Freeship</Tag> : (record.type === 'PERCENT' ? "Giảm %" : "Tiền mặt")
        },
        { 
            title: "Giá Trị", 
            dataIndex: "value", 
            align: 'center',
            render: (val, record) => {
                if (record.isFreeShip) return <Text type="secondary" className="text-[11px]">Free Shipping</Text>;
                return <Text strong className="text-[13px]">{record.type === 'PERCENT' ? `${val}%` : `${val.toLocaleString()} ₫`}</Text>;
            }
        },
        { 
            title: "Trong Kho", 
            dataIndex: "quantity",
            align: 'center',
            render: (qty) => <Text className="font-mono text-[12px]">{qty}</Text>
        },
        { 
            title: "Trạng Thái", 
            dataIndex: "isActive", 
            align: 'center',
            render: (active) => <Tag color={active ? "success" : "default"} className="border-none text-[10px] uppercase font-bold">{active ? "Hoạt động" : "Tạm tắt"}</Tag>
        },
        {
            title: "Hiệu Lực",
            key: "time",
            align: 'center',
            render: (_, record) => (
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
                    <div>S: {record.startDate ? dayjs(record.startDate).format("DD/MM/YY") : "NOW"}</div>
                    <div>E: {record.expirationDate ? dayjs(record.expirationDate).format("DD/MM/YY") : "INF"}</div>
                </div>
            )
        },
        {
            title: "Thao Tác",
            key: "action",
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleAddEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa voucher này không?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Card 
            title={
                <div className="py-1">
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 m-0 leading-none">
                        Quản Lý Voucher
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 block">
                        Phát hành mã giảm giá và khuyến mãi thành viên
                    </span>
                </div>
            }
            className="shadow-sm border-none rounded-2xl" 
            extra={
                <Button 
                    type="primary" 
                    size="middle"
                    icon={<PlusOutlined />} 
                    onClick={() => handleAddEdit()}
                    className="shadow-md shadow-blue-500/10 rounded-xl px-6 h-10 text-[12px] font-bold uppercase tracking-wider"
                >
                    Thêm Voucher
                </Button>
            }
        >
            <Table columns={columns} dataSource={vouchers} rowKey="_id" loading={loading} />
            
            <Modal 
                title={editingVoucher ? "Chỉnh sửa Voucher" : "Thêm Voucher mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Mã Voucher (Code)" name="code" rules={[{ required: true, message: "Nhập mã voucher" }]}>
                            <Input placeholder="Vd: SPORTGEAR20" />
                        </Form.Item>
                        <Form.Item label="Miễn phí vận chuyển" name="isFreeShip" valuePropName="checked">
                           <Select>
                               <Option value={true}>Bật Freeship</Option>
                               <Option value={false}>Không (Giảm tiền mặt/%)</Option>
                           </Select>
                        </Form.Item>
                        <Form.Item label="Loại giảm giá" name="type" rules={[{ required: !isFreeShip }]}>
                            <Select disabled={isFreeShip}>
                                <Option value="PERCENT">Phần trăm (%)</Option>
                                <Option value="FIXED">Giá tiền cố định (VNĐ)</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Giá trị giảm" name="value" rules={[{ required: !isFreeShip }]}>
                            <InputNumber style={{ width: '100%' }} min={0} disabled={isFreeShip} />
                        </Form.Item>
                        <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item label="Giá trị giảm tối đa (VNĐ)" name="maxDiscountValue">
                            <InputNumber style={{ width: '100%' }} min={0} disabled={isFreeShip} />
                        </Form.Item>
                        <Form.Item label="Đơn tối thiểu (VNĐ)" name="minOrderValue">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item label="Ngày bắt đầu" name="startDate">
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Ngày kết thúc" name="expirationDate">
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                            <Select>
                                <Option value={true}>Hoạt động</Option>
                                <Option value={false}>Tạm tắt</Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </Card>
    );
};

export default VoucherManagement;
