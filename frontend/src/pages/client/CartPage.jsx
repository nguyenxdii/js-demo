import React from "react";
import { 
  Table, 
  Button, 
  InputNumber, 
  Typography, 
  Empty, 
  Card, 
  Divider, 
  message,
  Breadcrumb,
  Tag
} from "antd";
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  ArrowLeftOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const { Title, Text } = Typography;

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const getFullImageUrl = (url) => {
    if (!url) return "/images/placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    return `http://localhost:8080${pathOnly}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const columns = [
    {
      title: <span className="uppercase text-xs font-bold text-gray-400 tracking-wider">Sản phẩm</span>,
      key: "product",
      render: (_, record) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl overflow-hidden p-1 flex-shrink-0">
            <img 
              src={getFullImageUrl(record.productImage)} 
              alt={record.productName} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <Link to={`/product/${record.productSlug}`} className="font-bold text-gray-900 hover:text-primary transition-colors block leading-tight mb-1">
              {record.productName}
            </Link>
            <Tag borderless color="orange" className="text-[10px] uppercase font-bold px-2 rounded-full">Sport Gear</Tag>
          </div>
        </div>
      ),
    },
    {
      title: <span className="uppercase text-xs font-bold text-gray-400 tracking-wider">Đơn giá</span>,
      dataIndex: "price",
      key: "price",
      render: (price) => <span className="font-bold text-gray-900">{formatPrice(price)}</span>,
    },
    {
      title: <span className="uppercase text-xs font-bold text-gray-400 tracking-wider text-center block">Số lượng</span>,
      key: "quantity",
      render: (_, record) => (
        <div className="flex justify-center">
            <InputNumber
                min={1}
                max={record.product?.stock || 99}
                value={record.quantity}
                onChange={(val) => updateQuantity(record._id, val)}
                className="rounded-lg w-16"
            />
        </div>
      ),
    },
    {
      title: <span className="uppercase text-xs font-bold text-gray-400 tracking-wider text-right block">Thành tiền</span>,
      key: "subtotal",
      render: (_, record) => (
        <span className="font-bold text-red-600 block text-right">
          {formatPrice(record.price * record.quantity)}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeFromCart(record._id)}
          className="hover:bg-red-50 rounded-full flex items-center justify-center mx-auto"
        />
      ),
    },
  ];

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
          description={
            <div className="mt-4">
              <Title level={4} className="text-gray-400">Giỏ hàng của bạn đang trống</Title>
              <Text type="secondary">Hãy quay lại và chọn cho mình những sản phẩm ưng ý nhất nhé!</Text>
            </div>
          }
        >
          <Link to="/">
            <Button type="primary" size="large" icon={<ArrowLeftOutlined />} className="h-12 px-8 rounded-xl font-bold mt-6 shadow-lg shadow-blue-100">
              TIẾP TỤC MUA SẮM
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Giỏ hàng</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="!mb-8 !text-3xl font-bold text-gray-900 uppercase tracking-tight">
           Giỏ hàng của bạn <span className="text-gray-300 ml-2">({cart.items.length})</span>
        </Title>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Main Table */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="rounded-3xl shadow-sm border-none overflow-hidden">
              <Table 
                dataSource={cart.items} 
                columns={columns} 
                rowKey="_id" 
                pagination={false}
                loading={loading}
                className="cart-table"
              />
              <div className="p-6 bg-white border-t border-gray-50">
                 <Link to="/" className="text-primary font-bold hover:underline flex items-center gap-2">
                    <ArrowLeftOutlined style={{ fontSize: '12px' }} /> Tiếp tục mua sắm
                 </Link>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="rounded-3xl shadow-lg border-none">
              <Title level={4} className="!mb-6 uppercase text-sm font-bold text-gray-400 tracking-widest">Tóm tắt đơn hàng</Title>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-600">
                  <Text>Tạm tính</Text>
                  <Text className="font-bold text-gray-900">{formatPrice(cart.totalAmount)}</Text>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <Text>Giảm giá</Text>
                  <Text className="text-green-500 font-bold">- {formatPrice(0)}</Text>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                   <Text>Phí vận chuyển</Text>
                   {cart.totalAmount >= 1000000 ? (
                     <Tag className="m-0 bg-blue-50 text-blue-500 border-none font-bold uppercase text-[10px] rounded-full">Miễn phí</Tag>
                   ) : (
                     <Text className="font-bold text-gray-900">{formatPrice(30000)}</Text>
                   )}
                </div>
                
                <Divider className="my-6 border-gray-100" />
                
                <div className="flex justify-between items-center">
                  <Text className="text-lg font-bold text-gray-900">Tổng cộng</Text>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600 leading-none mb-1">
                        {formatPrice(cart.totalAmount + (cart.totalAmount >= 1000000 ? 0 : 30000))}
                    </div>
                    <Text type="secondary" className="text-[10px] uppercase font-bold tracking-tighter italic">Đã bao gồm VAT</Text>
                  </div>
                </div>

                <div className="pt-6">
                   <Button 
                    type="primary" 
                    danger 
                    size="large" 
                    icon={<ThunderboltOutlined />}
                    block 
                    className="h-16 rounded-2xl font-bold text-lg shadow-xl shadow-red-100 border-none bg-gradient-to-r from-red-600 to-orange-500 hover:scale-[1.02] transition-transform"
                    onClick={() => navigate("/checkout")}
                  >
                    TIẾN HÀNH THANH TOÁN
                  </Button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 grayscale opacity-50">
                     <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6" alt="visa" />
                     <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-6" alt="mastercard" />
                     <img src="https://img.icons8.com/color/48/000000/google-pay.png" className="h-6" alt="gpay" />
                     <img src="https://img.icons8.com/color/48/000000/apple-pay.png" className="h-6" alt="apay" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
