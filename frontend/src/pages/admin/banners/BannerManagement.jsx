import React, { useState, useEffect } from "react";
import { 
  Table, Button, Space, Modal, Form, Input, 
  Switch, Upload, message, Typography, Tag,
  Popconfirm, Card
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, EyeOutlined 
} from "@ant-design/icons";
import { bannerService } from "../../../services/bannerService";

const { Title, Text } = Typography;

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAllBanners();
      // Map backend fields (title, active, linkUrl, position) -> frontend (name, isActive, link, displayOrder)
      const mappedData = Array.isArray(data) ? data.map(b => ({
        ...b, 
        id: b._id || b.id,
        name: b.title || b.name || '',
        isActive: b.active !== undefined ? b.active : b.isActive,
        link: b.linkUrl || b.link || '',
        displayOrder: b.position !== undefined ? b.position : (b.displayOrder || 0),
      })) : [];
      setBanners(mappedData);
    } catch (error) {
      message.error("Lỗi khi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    if (cleanUrl.startsWith("uploads")) return `http://localhost:8080/${cleanUrl}`;
    return cleanUrl;
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setFileList([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBanner(record);
    setFileList([]);
    form.setFieldsValue({
      name: record.name,
      link: record.link,
      displayOrder: record.displayOrder,
      isActive: record.isActive
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await bannerService.deleteBanner(id);
      message.success("Xóa banner thành công");
      fetchBanners();
    } catch (error) {
      message.error("Lỗi khi xóa banner");
    }
  };

  const handleToggleActive = async (checked, record) => {
    try {
      const formData = new FormData();
      formData.append("isActive", checked);
      await bannerService.updateBanner(record.id, formData);
      message.success("Cập nhật trạng thái thành công");
      fetchBanners();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("link", values.link || "");
      formData.append("displayOrder", values.displayOrder || 0);
      formData.append("isActive", values.isActive === undefined ? true : values.isActive);

      if (fileList.length > 0) {
        // fileList[0].originFileObj dùng cho Antd upload chuẩn, 
        // nhưng if beforeUpload returns false, fileList[0] chính là file object
        const fileToUpload = fileList[0].originFileObj || fileList[0];
        formData.append("file", fileToUpload);
        console.log("Uploading file:", fileToUpload.name);
      } else if (!editingBanner) {
        message.error("Vui lòng chọn ảnh cho banner mới");
        return;
      }

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
        message.success("Cập nhật banner thành công");
      } else {
        await bannerService.createBanner(formData);
        message.success("Thêm banner mới thành công");
      }
      setIsModalVisible(false);
      fetchBanners();
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lưu banner");
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Ngăn upload tự động
    },
    fileList,
  };

  const columns = [
    {
      title: "Hình Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      align: 'center',
      render: (url) => (
        <img 
          src={getFullImageUrl(url)} 
          alt="Banner" 
          style={{ width: "100px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid #f1f5f9" }} 
          className="mx-auto shadow-sm"
          onError={(e) => e.target.src = "/images/cat-placeholder.png"}
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>
    },
    {
      title: "Thứ Tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      align: "center",
      render: (order) => <Text className="font-mono font-bold text-slate-500">{order}</Text>
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          onChange={(checked) => handleToggleActive(checked, record)} 
        />
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger ghost icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-sm border-0 rounded-xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 m-0 leading-none">
              Quản Lý Banner
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 block">
              Quản lý hình ảnh quảng cáo và sự kiện trang chủ
            </span>
          </div>
          <Button 
            type="primary" 
            size="middle" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            className="shadow-md shadow-blue-500/10 rounded-xl px-6 h-10 text-[12px] font-bold uppercase tracking-wider"
          >
            Thêm Banner Mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={banners} 
          rowKey="id"
          loading={loading}
          className="custom-table"
        />
      </Card>

      <Modal
        title={editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tiêu đề Banner"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Ví dụ: Siêu hội Giày Chạy Pegasus" />
          </Form.Item>
 
          <Form.Item name="link" label="Đường dẫn liên kết (URL)">
            <Input placeholder="/products/giay-nike-pegasus" />
          </Form.Item>

          <Form.Item name="displayOrder" label="Thứ tự hiển thị" initialValue={0}>
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Hình ảnh Banner">
            <Upload {...uploadProps} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn file ảnh từ máy tính</Button>
            </Upload>
            {!editingBanner && <Text type="secondary" className="text-[11px] block mt-1">* Bắt buộc chọn ảnh cho banner mới</Text>}
            {editingBanner && <Text type="secondary" className="text-[11px] block mt-1">* Để trống nếu không muốn thay đổi ảnh hiện tại</Text>}
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerManagement;
