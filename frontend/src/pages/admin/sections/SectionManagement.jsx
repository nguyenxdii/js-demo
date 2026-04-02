import React, { useState, useEffect } from "react";
import { 
  Table, Button, Space, Modal, Form, Input, 
  Select, Switch, DatePicker, message, Typography, Card,
  Popconfirm, Tag, List, Avatar, InputNumber
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  MenuOutlined, ThunderboltOutlined, OrderedListOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from "dayjs";
import { sectionService } from "../../../services/sectionService";
import { productService } from "../../../services/productService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form] = Form.useForm();
  
  // Quản lý sản phẩm trong Section
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");

  const isAnyModalOpen = isModalVisible || isProductModalVisible;
 
  // Row thành phần cho Kéo thả
  const SortableRow = ({ children, ...props }) => {
    const rowKey = props['data-row-key'];
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: rowKey });
 
    const style = isAnyModalOpen ? { ...props.style } : {
      ...props.style,
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition,
      zIndex: isDragging ? 9999 : 0,
      position: isDragging ? 'relative' : undefined,
      background: isDragging ? '#f5f5f5' : undefined,
    };
 
    return (
      <tr {...props} ref={setNodeRef} style={style} {...attributes}>
        {React.Children.map(children, (child) => {
          if (child.key === 'sort') {
            return React.cloneElement(child, {
              children: (
                <MenuOutlined
                  {...listeners}
                  style={{ cursor: 'grab', color: '#999' }}
                />
              ),
            });
          }
          return child;
        })}
      </tr>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
    fetchInitialProducts();
  }, []);

  const normalizeSection = (s) => ({
    ...s,
    id: s._id || s.id,
    name: s.title || s.name || '',
    isActive: s.active !== undefined ? s.active : s.isActive,
  });

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await sectionService.getAllSections();
      const mappedData = data.map(normalizeSection);
      setSections(mappedData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      message.error("Lỗi khi tải danh sách section");
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialProducts = async () => {
    try {
      const response = await productService.getAllProducts({ limit: 1000 });
      // Backend trả về { products, page, pages }
      const items = Array.isArray(response) ? response : (response.products || []);
      const mappedItems = items.map(p => ({ ...p, id: p._id || p.id }));
      setAllProducts(mappedItems);
    } catch (error) {}
  };

  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = (url || '').replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    return `http://localhost:8080${pathOnly}`;
  };

  // Lấy tất cả productId đã thuộc các section khác
  const getOtherSectionProductIds = () => {
    if (!currentSection) return new Set();
    const ids = new Set();
    sections.forEach(s => {
      if (s.id !== currentSection.id && s.products) {
        s.products.forEach(p => ids.add(p._id || p.id || p));
      }
    });
    return ids;
  };

  const handleAddProductToSection = async (productId) => {
    try {
      const updatedSectionRaw = await sectionService.addProductToSection(currentSection.id, productId);
      const updatedSection = normalizeSection(updatedSectionRaw);
      setCurrentSection(updatedSection);
      setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
      message.success("Đã thêm sản phẩm vào khung");
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
    }
  };

  const handleRemoveProductFromSection = async (productId) => {
    try {
      const updatedSectionRaw = await sectionService.removeProductFromSection(currentSection.id, productId);
      const updatedSection = normalizeSection(updatedSectionRaw);
      setCurrentSection(updatedSection);
      setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
      message.success("Đã gỡ sản phẩm khỏi khung");
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi gỡ sản phẩm");
    }
  };

  const onDragEnd = async ({ active, over }) => {
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex(i => i.id === active.id);
      const newIndex = sections.findIndex(i => i.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      try {
        await sectionService.reorderSections(newSections.map(s => s.id));
        message.success("Đã cập nhật thứ tự hiển thị");
      } catch (error) {
        message.error("Lỗi khi sắp xếp lại");
        fetchSections();
      }
    }
  };

  const handleAdd = () => {
    setEditingSection(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSection(record);
    form.setFieldsValue({
      title: record.title || record.name,
      type: record.type,
      active: record.active !== undefined ? record.active : (record.isActive !== undefined ? record.isActive : true),
      rangeTime: record.startDate && record.endDate ? [dayjs(record.startDate), dayjs(record.endDate)] : null,
      layoutType: record.layoutType || 'STANDARD',
      hasDiscount: record.discountConfig?.active,
      discountLabel: record.discountConfig?.label,
      discountValue: record.discountConfig?.discountPercentage
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        type: values.type || 'CUSTOM',
        active: values.active !== undefined ? values.active : true,
        order: editingSection ? editingSection.order : sections.length,
        startDate: values.rangeTime ? values.rangeTime[0].toISOString() : null,
        endDate: values.rangeTime ? values.rangeTime[1].toISOString() : null,
        layoutType: values.layoutType || 'STANDARD',
        discountConfig: {
          active: values.hasDiscount,
          label: values.discountLabel || "Giảm giá sốc",
          discountPercentage: values.discountValue || 0
        },
      };

      if (editingSection) {
        await sectionService.updateSection(editingSection.id || editingSection._id, payload);
        message.success("Cập nhật section thành công");
      } else {
        await sectionService.createSection(payload);
        message.success("Thêm section mới thành công");
      }
      setIsModalVisible(false);
      fetchSections();
    } catch (error) {
      console.error('Section error:', error);
      message.error("Lỗi khi lưu section");
    }
  };

  const handleDelete = async (id) => {
    try {
      await sectionService.deleteSection(id);
      message.success("Xóa thành công");
      fetchSections();
    } catch (error) {
      message.error("Lỗi khi xóa");
    }
  };

  const columns = [
    { title: "", key: "sort", width: 50 },
    {
      title: "Tên khung",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>Slug: {record.slug}</Text>
        </Space>
      )
    },
    {
      title: "Loại chuyên mục",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        let label = "Bộ sưu tập";
        if (type === "FLASH_SALE_1") { color = "orange"; label = "Flash Sale v1 ⚡"; }
        if (type === "FLASH_SALE_2") { color = "volcano"; label = "Flash Sale v2 🔥"; }
        if (type === "FLASH_SALE_3") { color = "magenta"; label = "Flash Sale v3 💎"; }
        if (type === "NEW_ARRIVAL") { color = "green"; label = "Hàng mới về"; }
        if (type === "TOP_SELLING") { color = "purple"; label = "Bán chạy nhất"; }
        return <Tag color={color} className="rounded-full px-3">{label}</Tag>;
      }
    },
    {
      title: "Giảm giá",
      dataIndex: "discountConfig",
      key: "discount",
      render: (config) => config?.active ? (
        <Tag color="volcano" className="font-bold">
          -{config.discountPercentage}%
        </Tag>
      ) : <Tag color="default">Không</Tag>
    },
    {
      title: "Bố cục / Thời gian",
      key: "layout",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="orange" className="font-bold border-none">{record.layoutType}</Tag>
          {record.layoutType === "FLASH_SALE" && (
            <>
              <Text type="secondary" style={{ fontSize: '10px' }}>Từ: {dayjs(record.startDate).format("DD/MM HH:mm")}</Text>
              <Text type="danger" style={{ fontSize: '10px' }}>Đến: {dayjs(record.endDate).format("DD/MM HH:mm")}</Text>
            </>
          )}
        </Space>
      )
    },
    {
      title: "Sản phẩm",
      dataIndex: "products",
      key: "productsCount",
      render: (products) => <Tag color="orange" className="font-bold">{products?.length || 0} SP</Tag>
    },
    {
      title: "Bật/Tắt",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          onChange={async (checked) => {
             try {
               await sectionService.updateSection(record.id, { active: checked });
               message.success(`${checked ? 'Hiện' : 'Ẩn'} khung thành công`);
               fetchSections();
             } catch(e) { message.error('Lỗi khi cập nhật trạng thái'); }
          }} 
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<OrderedListOutlined />} onClick={() => { setCurrentSection(record); setIsProductModalVisible(true); }} />
          <Popconfirm title="Xóa khung này?" onConfirm={() => handleDelete(record.id)} okText="Xóa">
            <Button type="primary" danger ghost icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 overflow-hidden">
      <Card className="shadow-sm border-0 rounded-xl">
        <div className="flex flex-row justify-between items-center mb-8 border-b pb-6">
          <div className="space-y-1">
            <Title level={4} className="!mb-0 font-bold text-gray-800">Quản lý Bố cục Trang chủ</Title>
            <Text type="secondary" className="text-[11px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MenuOutlined className="text-gray-300" /> Kéo thả để sắp xếp thứ tự hiển thị các khung sản phẩm
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd} 
            className="font-bold flex items-center h-10 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 border-none shadow-sm shadow-orange-200 transition-all hover:scale-[1.02]"
          >
            Thêm Khung mới
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <Table
              components={{ body: { row: SortableRow } }}
              rowKey="id"
              columns={columns} 
              dataSource={sections} 
              loading={loading}
              pagination={false}
              className="mt-4"
            />
          </SortableContext>
        </DndContext>
      </Card>

      <Modal 
        title={
          <div className="py-2 border-b-2 border-orange-500 w-fit">
            <span className="font-['Outfit'] font-black uppercase italic tracking-tighter text-xl text-gray-800">
              {editingSection ? "🚀 Sửa cấu hình khung" : "✨ Tạo khung sản phẩm mới"}
            </span>
          </div>
        } 
        open={isModalVisible} 
        onOk={handleModalOk} 
        onCancel={() => setIsModalVisible(false)} 
        destroyOnClose 
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label={<Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tên khung hiển thị</Text>} rules={[{ required: true }]}>
            <Input className="rounded-lg h-10 font-bold border-gray-300" placeholder="Ví dụ: BỘ SƯU TẬP GIÀY NIKE MỚI" />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="layoutType" label={<Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mẫu giao diện (Layout)</Text>} initialValue="STANDARD">
              <Select className="h-10">
                <Select.Option value="STANDARD">⭐ Mẫu Chuẩn (Standard)</Select.Option>
                <Select.Option value="FLASH_SALE">⚡ Flash Sale (Countdown)</Select.Option>
                <Select.Option value="NEW_ARRIVAL">🆕 Hàng Mới Về</Select.Option>
                <Select.Option value="BEST_SELLER">🏆 Bán Chạy Nhất</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="active" label={<Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trạng thái</Text>} valuePropName="checked" initialValue={true}>
              <Switch className="bg-gray-200" />
            </Form.Item>
          </div>

          <Form.Item noStyle shouldUpdate={(prev, current) => prev.layoutType !== current.layoutType}>
            {({ getFieldValue }) => getFieldValue('layoutType') === 'FLASH_SALE' && (
              <Form.Item name="rangeTime" label={<Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Thời gian diễn ra Sale</Text>} rules={[{ required: true }]}>
                <RangePicker showTime size="small" className="w-full h-10 rounded-lg border-gray-300" />
              </Form.Item>
            )}
          </Form.Item>

          <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-100 mb-6 mt-4">
            <div className="flex items-center justify-between mb-4">
               <Text className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Cấu hình giảm giá chung</Text>
               <Form.Item name="hasDiscount" valuePropName="checked" noStyle>
                  <Switch size="small" className="bg-gray-300" />
               </Form.Item>
            </div>
            <Form.Item noStyle shouldUpdate={(prev, current) => prev.hasDiscount !== current.hasDiscount}>
               {({ getFieldValue }) => getFieldValue('hasDiscount') && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                     <Form.Item name="discountLabel" label={<Text className="text-[10px] font-bold uppercase text-gray-400">Nhãn giảm giá</Text>} initialValue="Giảm giá sốc">
                        <Input size="small" className="rounded-lg h-9 border-gray-300" />
                     </Form.Item>
                     <Form.Item name="discountValue" label={<Text className="text-[10px] font-bold uppercase text-gray-400">Phần trăm giảm (%)</Text>} rules={[{ required: true, message: 'Nhập giá trị' }]}>
                        <InputNumber className="w-full rounded-lg h-9" size="small" min={0} max={100} addonAfter="%" />
                     </Form.Item>
                  </div>
               )}
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal 
        title={
          <div className="py-2 border-b-2 border-orange-500 w-fit">
            <span className="font-['Outfit'] font-black uppercase italic tracking-tighter text-xl text-gray-800">
              📦 Sản phẩm trong: {currentSection?.name}
            </span>
          </div>
        } 
        open={isProductModalVisible} 
        onCancel={() => setIsProductModalVisible(false)} 
        footer={null} 
        width={800} 
        destroyOnClose
      >
         <div className="mb-4">
             <Input prefix={<SearchOutlined />} placeholder="Tìm sản phẩm để thêm vào khung..." onChange={(e) => setSearchProduct(e.target.value)} className="h-11 rounded-xl" />
         </div>
         <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="pr-2 custom-scrollbar">
             <List itemLayout="horizontal" dataSource={(() => {
                 const otherIds = getOtherSectionProductIds();
                 return allProducts.filter(p => {
                   const matchSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
                   const isInCurrent = currentSection?.products?.some(sp => (sp._id || sp.id || sp) === p.id);
                   const isInOther = otherIds.has(p.id);
                   // Hiện sản phẩm nếu: khớp tìm kiếm VÀ (đang trong section hiện tại HOẶC chưa thuộc section nào)
                   return matchSearch && (isInCurrent || !isInOther);
                 });
             })()} renderItem={(item) => {
                 const isInSection = currentSection?.products?.some(p => (p._id || p.id || p) === item.id);
                 return (
                     <List.Item actions={[
                         isInSection ? 
                         ( <Button danger type="link" onClick={() => handleRemoveProductFromSection(item.id)} className="font-black text-xs uppercase font-['Outfit']">Gỡ bỏ</Button> ) : 
                         ( <Button type="link" onClick={() => handleAddProductToSection(item.id)} className="font-black text-xs uppercase text-primary font-['Outfit']">Thêm vào</Button> )
                     ]}>
                         <List.Item.Meta avatar={<Avatar shape="square" size={48} src={getFullImageUrl(item.mainImageUrl || item.imageUrl)} className="border border-gray-100" />} title={<Text className="text-xs font-black text-gray-800 line-clamp-1 font-['Outfit']">{item.name}</Text>} description={<Text className="text-[10px] font-black text-primary uppercase font-['Outfit']">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</Text>} />
                     </List.Item>
                 );
             }} />
         </div>
      </Modal>
    </div>
  );
};

export default SectionManagement;
