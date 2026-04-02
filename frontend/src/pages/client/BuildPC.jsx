import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Tag, Modal, Input, Radio, Space, Spin, message, Tooltip, Flex } from 'antd';
import { 
  ThunderboltOutlined, 
  SettingOutlined, 
  ShoppingCartOutlined, 
  SaveOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  SwapOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { SLOTS, useBuildPC } from '../../contexts/BuildPCContext';
import ComponentSelectorModal from '../../components/client/build/ComponentSelectorModal';
import { useCart } from '../../contexts/CartContext';
import axiosInstance from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function BuildPC() {
  const { selectedParts, selectPart, removePart, clearBuild, totalPrice, totalWattage } = useBuildPC();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [autoBuildVisible, setAutoBuildVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Auto Build Inputs
  const [budget, setBudget] = useState(20000000);
  const [usage, setUsage] = useState('Chơi game');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng Xây dựng PC');
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleOpenSelector = (slot) => {
    setActiveSlot(slot);
    setModalVisible(true);
  };

  const handleSelectPart = (product) => {
    selectPart(activeSlot.id, product);
    setModalVisible(false);
    message.success(`Đã thêm ${product.name}`);
  };

  const handleAutoBuild = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/build-pc/suggest', {
        budget: budget,
        usage: usage
      });
      
      const suggestedParts = response.data;
      clearBuild();
      
      suggestedParts.forEach(product => {
        const slot = SLOTS.find(s => s.category === product.category?.slug);
        if (slot) {
          selectPart(slot.id, product);
        }
      });
      
      message.success('Đã tạo cấu hình tối ưu bằng AI!');
      setAutoBuildVisible(false);
    } catch (error) {
      console.error('Lỗi build tự động:', error);
      message.error('Không thể tự động build lúc này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBuild = async () => {
    if (!user) return;
    
    const items = {};
    Object.entries(selectedParts).forEach(([slotId, product]) => {
      if (product) items[slotId] = product.sku;
    });

    if (Object.keys(items).length === 0) {
      message.warning('Vui lòng chọn ít nhất một linh kiện để lưu');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/build-pc/save', {
        userId: user.id,
        name: `Cấu hình của ${user.fullName} - ${new Date().toLocaleDateString('vi-VN')}`,
        items: items
      });
      message.success('Đã lưu cấu hình PC thành công!');
    } catch (error) {
      console.error('Lỗi lưu cấu hình:', error);
      message.error('Không thể lưu cấu hình lúc này.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    const items = Object.values(selectedParts);
    if (items.length === 0) {
      message.warning('Vui lòng chọn linh kiện trước khi thêm vào giỏ hàng');
      return;
    }
    
    items.forEach(p => addToCart(p.id, 1));
    message.success('Đã thêm tất cả linh kiện vào giỏ hàng!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full mb-4">
                <ThunderboltOutlined className="text-sm" />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI-Powered PC Builder</span>
              </div>
              <Title level={1} className="!mb-4 !text-5xl font-bold tracking-tight">
                XÂY DỰNG CẤU HÌNH <span className="text-orange-500">MƠ ƯỚC</span>
              </Title>
              <Text className="text-gray-500 text-lg">Tự tay lựa chọn hoặc để trí tuệ nhân tạo tư vấn bộ máy tối ưu nhất theo ngân sách của bạn.</Text>
            </div>
            
            <div className="flex gap-4">
              <Button 
                size="large" 
                className="h-14 px-8 rounded-2xl border-orange-200 text-orange-600 font-bold hover:!border-orange-500 hover:!text-orange-500 transition-all shadow-sm"
                icon={<SettingOutlined />} 
                onClick={() => setAutoBuildVisible(true)}
              >
                Tư vấn thông minh (AI)
              </Button>
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />}
                className="h-14 px-8 rounded-2xl bg-orange-500 hover:!bg-orange-600 border-none font-bold shadow-lg shadow-orange-200 transition-all"
                onClick={handleAddAllToCart}
              >
                MUA TRỌN BỘ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 mt-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Component List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
               <Title level={4} className="!mb-0 font-bold">Danh sách linh kiện</Title>
               <Text className="text-gray-400 font-medium">Chọn tối thiểu CPU và Mainboard để bắt đầu</Text>
            </div>
            
            {SLOTS.map((slot) => {
              const product = selectedParts[slot.id];
              return (
                <Card 
                  key={slot.id}
                  className={`rounded-3xl border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${product ? 'ring-2 ring-orange-500/20 border-orange-200' : ''}`}
                  bodyStyle={{ padding: '20px 24px' }}
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Slot Info */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className={`w-20 h-20 rounded-2xl transition-colors duration-300 flex items-center justify-center p-3 flex-shrink-0 ${product ? 'bg-white border border-gray-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                        {product ? (
                          <img src={product.mainImageUrl || "/images/cat-placeholder.png"} alt={product.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-gray-300 text-2xl"><SettingOutlined /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">{slot.name}</Text>
                          {product && <Tag color="orange" className="rounded-md border-none text-[9px] uppercase font-bold px-2">Đã chọn</Tag>}
                        </div>
                        
                        {product ? (
                          <div className="truncate pr-4">
                            <Title level={5} className="!mb-1 !text-base truncate font-bold hover:text-orange-500 transition-colors cursor-pointer">
                              {product.name}
                            </Title>
                            <Text className="text-orange-600 font-bold text-base">
                              {formatPrice(product.salePrice || product.price)}
                            </Text>
                          </div>
                        ) : (
                          <Text className="text-gray-300 font-medium">Chưa chọn linh kiện</Text>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {product ? (
                        <>
                          <Tooltip title="Đổi linh kiện">
                            <Button shape="circle" size="large" icon={<SwapOutlined />} className="hover:!text-orange-500 hover:!border-orange-500 transition-all" onClick={() => handleOpenSelector(slot)} />
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <Button shape="circle" size="large" danger icon={<DeleteOutlined />} className="hover:scale-110 transition-transform" onClick={() => removePart(slot.id)} />
                          </Tooltip>
                        </>
                      ) : (
                        <Button 
                          type="primary" 
                          size="large"
                          icon={<ShoppingCartOutlined />} 
                          className="rounded-xl px-6 bg-gray-900 border-none hover:!bg-orange-500 transition-all font-bold shadow-md"
                          onClick={() => handleOpenSelector(slot)}
                        >
                          Chọn
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Sticky Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <Card className="rounded-[40px] border-none shadow-2xl bg-white overflow-hidden p-2">
                <div className="bg-orange-500 rounded-[34px] p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <SettingOutlined className="text-8xl" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8 bg-white/20 w-fit px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <Text className="text-[10px] font-bold uppercase text-white tracking-widest">Cấu hình của bạn</Text>
                    </div>
                    <Title level={1} className="!text-white !mb-4 !text-5xl font-bold tracking-tight leading-none">
                      {formatPrice(totalPrice)}
                    </Title>
                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-xs font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><CheckCircleOutlined /> {Object.keys(selectedParts).length} Linh kiện</span>
                      <span className="flex items-center gap-1.5"><ThunderboltOutlined /> {totalWattage}W</span>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <Text className="text-gray-400 font-bold">Tạm tính</Text>
                      <Text className="font-bold text-gray-900">{formatPrice(totalPrice)}</Text>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <Text className="text-gray-400 font-bold">Lắp đặt & Giao hàng</Text>
                      <Text className="text-green-500 font-bold">MIỄN PHÍ</Text>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      block 
                      size="large" 
                      className="h-14 rounded-2xl border-gray-100 font-bold text-gray-600 hover:!border-orange-500 hover:!text-orange-500 transition-all"
                      icon={<SaveOutlined />} 
                      onClick={handleSaveBuild}
                      loading={loading}
                    >
                      Lưu lại
                    </Button>
                    <Button 
                      block 
                      size="large" 
                      className="h-14 rounded-2xl border-gray-100 font-bold text-red-500 hover:!bg-red-50 hover:!border-red-100 transition-all"
                      icon={<DeleteOutlined />} 
                      onClick={() => {
                        Modal.confirm({
                          title: 'Xóa toàn bộ cấu hình?',
                          content: 'Tất cả linh kiện đã chọn sẽ bị gỡ bỏ khỏi danh sách.',
                          okText: 'Xóa sạch',
                          cancelText: 'Hủy',
                          okButtonProps: { danger: true, className: 'rounded-lg' },
                          cancelButtonProps: { className: 'rounded-lg' },
                          onOk: clearBuild
                        });
                      }}
                    >
                      Làm mới
                    </Button>
                  </div>

                  <Button 
                    type="primary" 
                    block 
                    size="large" 
                    icon={<ShoppingCartOutlined />} 
                    className="h-16 text-xl font-bold tracking-tight bg-orange-500 hover:!bg-orange-600 border-none rounded-3xl shadow-xl shadow-orange-100 transition-all"
                    onClick={handleAddAllToCart}
                  >
                    THÊM TẤT CẢ VÀO GIỎ
                  </Button>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Auto Build Selection Modal */}
      <Modal
        title={<div className="font-semibold text-gray-900 text-[11px] tracking-[0.2em] uppercase">TƯ VẤN CẤU HÌNH THÔNG MINH</div>}
        open={autoBuildVisible}
        onCancel={() => setAutoBuildVisible(false)}
        footer={null}
        width={420}
        centered
        className="premium-modal-flat"
        bodyStyle={{ padding: '0 18px 20px' }}
      >
        <div className="space-y-4 mt-5">
          <div className="bg-gray-50/50 p-4 rounded-[20px] border border-gray-100">
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <DollarOutlined className="text-orange-500 text-[10px]" />
              <Text className="text-[9px] font-semibold uppercase text-gray-600 tracking-wider">Ngân sách dự kiến</Text>
            </div>
            
            <div className="relative group bg-white rounded-[16px] overflow-hidden shadow-sm border border-gray-100 focus-within:border-orange-500/30 transition-all p-1">
               <Input 
                 type="number" 
                 variant="borderless"
                 value={budget} 
                 onChange={e => setBudget(Number(e.target.value))}
                 prefix={<span className="pl-2 pr-1 text-[10px] font-bold text-orange-500/60 uppercase tracking-tight">VND</span>}
                 className="h-10 !text-sm font-bold text-gray-900 w-full"
               />
            </div>
            
            <Flex gap="4px" wrap="wrap" className="mt-4 px-1">
              {[15, 20, 25, 30, 40, 50].map(m => (
                <div 
                  key={m} 
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all font-semibold text-[8.5px] uppercase tracking-wide ${budget === m * 1000000 ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                  onClick={() => setBudget(m * 1000000)}
                >
                  {m} Triệu
                </div>
              ))}
            </Flex>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5 px-2">
              <ThunderboltOutlined className="text-orange-500 text-[10px]" />
              <Text className="text-[9px] font-semibold uppercase text-gray-600 tracking-wider">Nhu cầu sử dụng</Text>
            </div>
            <div className="grid grid-cols-1 gap-1.5 px-1">
              {[
                { label: 'Chơi game High-End', value: 'Chơi game', desc: 'Tối ưu cho FPS và đồ họa mượt mà' },
                { label: 'Làm việc đồ họa / Render', value: 'Đồ họa', desc: 'Ưu tiên sức mạnh CPU đa nhân và RAM lớn' },
                { label: 'Văn phòng / Giải trí cơ bản', value: 'Văn phòng', desc: 'Hoạt động ổn định, êm ái, tiết kiệm điện' }
              ].map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => setUsage(opt.value)}
                  className={`p-3.5 cursor-pointer flex flex-col rounded-[14px] border transition-all duration-300 relative group overflow-hidden ${usage === opt.value ? 'border-orange-500/50 bg-orange-50/10' : 'border-gray-50 bg-white hover:border-orange-200'}`}
                >
                  <span className={`font-semibold text-[13px] ${usage === opt.value ? 'text-orange-600' : 'text-gray-800'}`}>{opt.label}</span>
                  <span className="text-[8.5px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">{opt.desc}</span>
                  {usage === opt.value && <div className="absolute top-4 right-4 text-orange-500 text-xs"><CheckCircleOutlined /></div>}
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="primary" 
            block 
            size="large" 
            loading={loading}
            icon={<ThunderboltOutlined className="text-xs" />}
            className="h-11 text-[13px] font-medium tracking-tight bg-orange-500 hover:!bg-orange-600 border-none rounded-[12px] shadow-md shadow-orange-50 mt-1 flex items-center justify-center gap-2 group"
            onClick={handleAutoBuild}
          >
            BẮT ĐẦU TƯ VẤN AI
          </Button>
        </div>
      </Modal>

      {/* Component Selector Modal */}
      <ComponentSelectorModal 
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSelect={handleSelectPart}
        slotName={activeSlot?.name}
        categorySlug={activeSlot?.category}
        currentSocket={selectedParts['cpu']?.socketType || selectedParts['main']?.socketType}
        currentRam={selectedParts['main']?.ramType || selectedParts['cpu']?.ramType}
      />
    </div>
  );
}
