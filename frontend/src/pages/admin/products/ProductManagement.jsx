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
  InputNumber,
  Select,
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
import { productService } from "../../../services/productService";
import { categoryService } from "../../../services/categoryService";
import { brandService } from "../../../services/brandService";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchText, setSearchText] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchText.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    fetchData();
    fetchSupportData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Thêm limit=1000 để lấy toàn bộ sản phẩm (vì seeder nạp 140)
      const response = await productService.getAllProducts({ limit: 1000 });
      // Backend Node.js trả về {products: [...], page, pages, total}
      const items = response.products || (Array.isArray(response) ? response : []);
      const mappedItems = items.map(p => ({
          ...p,
          isActive: p.active !== undefined ? p.active : p.isActive,
      }));
      setProducts(mappedItems);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [catData, brandData] = await Promise.all([
        categoryService.getAllCategories(),
        brandService.getActiveBrands(),
      ]);
      setCategories(catData);
      setBrands(brandData);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "mainImageUrl",
      key: "mainImageUrl",
      width: 100,
      render: (url) => {
        const fullUrl = url && !url.startsWith("http") ? `http://localhost:8080${url}` : url;
        return fullUrl ? (
          <img
            src={fullUrl}
            alt="product"
            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          "-"
        );
      },
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            SKU: {record.sku}
          </Text>
        </div>
      ),
    },
    {
      title: "Danh mục / Thương hiệu",
      key: "cat_brand",
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.category?.name || "N/A"}</Tag>
          <br />
          <Tag color="purple" style={{ marginTop: 4 }}>
            {record.brand?.name || "N/A"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Kho",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <span style={{ color: stock < 5 ? "red" : "inherit" }}>{stock}</span>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (
        <Tag color={gender === "Nam" ? "blue" : gender === "Nữ" ? "magenta" : "gold"}>
          {gender || "Unisex"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang bán" : "Ngừng bán"}
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
    setModalTitle("Thêm Sản Phẩm Mới");
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setModalTitle("Cập Nhật Sản Phẩm");
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      price: record.price,
      sku: record.sku,
      stock: record.stock,
      description: record.description,
      categoryId: record.category?._id || record.category,
      brandId: record.brand?._id || record.brand,
      gender: record.gender || "Unisex",
      isActive: record.active !== undefined ? record.active : record.isActive,
    });

    if (record.mainImageUrl) {
      setFileList([
        {
          uid: "-1",
          name: "product.png",
          status: "done",
          url: record.mainImageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: "Xóa sản phẩm này?",
      icon: <ExclamationCircleOutlined />,
      content: 'Bấm "Xóa vĩnh viễn" hoặc "Chỉ ẩn đi" để ngừng bán.',
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
      await productService.softDeleteProduct(id);
      message.success("Đã ngừng bán sản phẩm");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleHardDelete = async (id) => {
    try {
      await productService.hardDeleteProduct(id);
      message.success("Đã xóa vĩnh viễn sản phẩm");
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
        // Chuyển sang format flat thay vì Blob JSON cho Node.js Backend xử lý (với Multer)
        Object.keys(values).forEach(key => {
           if (values[key] !== undefined && values[key] !== null) {
              // Map lại các ID relation
              if (key === 'categoryId') formData.append('categoryId', values[key]);
              else if (key === 'brandId') formData.append('brandId', values[key]);
              else formData.append(key, values[key]);
           }
        });

        // Đóng gói danh sách ảnh
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("files", file.originFileObj);
          }
        });

        if (editingId) {
          await productService.updateProduct(editingId, formData);
          message.success("Cập nhật sản phẩm thành công!");
        } else {
          await productService.createProduct(formData);
          message.success("Thêm sản phẩm thành công!");
        }
        setIsModalVisible(false);
        fetchData();
      } catch (error) {
        message.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const beforeUpload = (file) => {
    const isImg = file.type.startsWith("image/");
    if (!isImg) message.error("Chỉ tải lên file ảnh!");
    return false;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Quản Lý Sản Phẩm (Products)</Title>
          <Text type="secondary">Quản lý kho hàng, giá bán và thông tin sản phẩm.</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm Sản Phẩm
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Tìm theo tên sản phẩm hoặc SKU..."
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="h-10 rounded-lg w-80"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 12 }}
      />

      <Modal
        title={editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={650}
        confirmLoading={submitting}
        okText={editingId ? "Cập nhật" : "Lưu dữ liệu"}
        cancelText="Hủy"
        className="top-5"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true, stock: 0 }} size="small">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              className="col-span-2"
              rules={[{ required: true, message: "Nhập tên sản phẩm!" }]}
            >
              <Input placeholder="VD: Giày chạy bộ Nike Air Zoom Pegasus 40" />
            </Form.Item>

            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
              <Select 
                placeholder="Chọn danh mục" 
                showSearch
                optionFilterProp="label"
                options={categories.filter(c => c.parent).map(c => ({
                  value: c._id,
                  label: c.name
                }))}
              />
            </Form.Item>
 
            <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
              <Select 
                placeholder="Chọn thương hiệu" 
                showSearch
                optionFilterProp="label"
                options={brands.map(b => ({
                  value: b._id,
                  label: b.name
                }))}
              />
            </Form.Item>

            <Form.Item name="price" label="Giá bán (VND)" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item name="sku" label="Mã SKU (Model)" rules={[{ required: true }]}>
              <Input placeholder="VD: NIKE-PEG40-BK-01" />
            </Form.Item>

            <Form.Item name="stock" label="Số lượng tồn kho" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            
            <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Unisex">Unisex (Cả hai)</Option>
              </Select>
            </Form.Item>

            <Form.Item name="slug" label="Slug (Đường dẫn)">
              <Input placeholder="Để trống hệ thống sẽ tự tạo" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả tóm tắt" className="col-span-2">
              <Input.TextArea rows={2} placeholder="Chất liệu, công nghệ đệm, hướng dẫn chọn size..." />
            </Form.Item>

            <Form.Item label="Hình ảnh sản phẩm" className="col-span-2">
              <div className="mb-4">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={beforeUpload}
                  multiple
                  maxCount={8}
                >
                  {fileList.length < 8 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </div>
            </Form.Item>

            <Form.Item name="isActive" label="Trạng thái kinh doanh" valuePropName="checked">
              <Switch checkedChildren="Đang bán" unCheckedChildren="Tạm ẩn" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
