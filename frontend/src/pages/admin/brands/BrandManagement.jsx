import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Tag,
  Form,
  Input,
  Switch,
  Upload,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { brandService } from "../../../services/brandService";

const { confirm } = Modal;
const { Title, Text } = Typography;

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchText, setSearchText] = useState("");

  const filteredBrands = brands.filter(b => 
    (b?.name?.toLowerCase() || "").includes(searchText.toLowerCase()) || 
    (b?.slug?.toLowerCase() || "").includes(searchText.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await brandService.getAllBrands(true);
      setBrands(data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Logo",
      dataIndex: "logoUrl",
      key: "logoUrl",
      width: 70,
      align: 'center',
      render: (url) => {
        const fullUrl = url && !url.startsWith("http") ? `http://localhost:8080${url}` : url;
        return fullUrl ? (
          <img
            src={fullUrl}
            alt="icon"
            style={{ width: 50, height: 50, objectFit: "contain", borderRadius: 6 }}
            className="mx-auto"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center text-gray-300 mx-auto text-[10px]">
            -
          </div>
        );
      },
    },
    {
      title: "Tên Thương Hiệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const showAddModal = () => {
    setModalTitle("Thêm Thương Hiệu Mới");
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setModalTitle("Sửa Thương Hiệu");
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      isActive: record.isActive,
    });
    if (record.logoUrl) {
      setFileList([
        {
          uid: "-1",
          name: "logo.png",
          status: "done",
          url: record.logoUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: "Xác nhận xóa thương hiệu?",
      icon: <ExclamationCircleOutlined />,
      content: 'Chọn "Ẩn đi" để tạm dừng hiển thị hoặc "Xóa vĩnh viễn".',
      okText: "Xóa vĩnh viễn",
      okType: "danger",
      cancelText: "Hủy",
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <Button
            type="default"
            danger
            onClick={() => handleSoftDelete(record._id)}
          >
            Chỉ Ẩn Đi
          </Button>
          <OkBtn />
        </>
      ),
      onOk() {
        return handleHardDelete(record._id);
      },
    });
  };

  const handleSoftDelete = async (id) => {
    Modal.destroyAll();
    try {
      const response = await brandService.toggleBrandStatus(id);
      message.success(response.message || "Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleHardDelete = async (id) => {
    try {
      await brandService.deleteBrandPermanent(id);
      message.success("Đã xóa vĩnh viễn thương hiệu");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setSubmitting(true);
        const formData = new FormData();
        formData.append("name", values.name);
        if (values.slug) formData.append("slug", values.slug);
        formData.append("isActive", values.isActive === undefined ? true : values.isActive);

        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("logo", fileList[0].originFileObj);
        }

        if (editingId) {
          await brandService.updateBrand(editingId, formData);
          message.success("Cập nhật thành công");
        } else {
          await brandService.createBrand(formData);
          message.success("Thêm mới thành công");
        }
        setIsModalVisible(false);
        fetchData();
      } catch (error) {
        message.error(error.response?.data?.message || "Lỗi hệ thống");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) message.error("Chỉ được tải lên file ảnh!");
    return false;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 m-0 leading-none">
            Quản Lý Thương Hiệu
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 block">
             Quản lý các hãng sản xuất và logo thương hiệu
          </span>
        </div>
        <Button 
          type="primary" 
          size="middle" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          className="shadow-md shadow-blue-500/10 rounded-xl px-6 h-10 text-[12px] font-bold uppercase tracking-wider"
        >
          Thêm Thương Hiệu
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Tìm theo tên thương hiệu hoặc slug..."
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="h-10 rounded-lg w-80"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredBrands}
        rowKey="_id"
        loading={loading}
        size="small"
      />

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item
            name="name"
            label="Tên Thương Hiệu"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="VD: Nike, Adidas, Yonex..." />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="Để trống để tự tạo" />
          </Form.Item>
          <Form.Item label="Logo">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandManagement;
