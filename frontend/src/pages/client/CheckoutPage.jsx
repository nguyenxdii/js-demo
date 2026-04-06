import React, { useState, useEffect } from "react";
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Radio, 
  Button, 
  Divider, 
  Breadcrumb, 
  message, 
  Space,
  Tag
} from "antd";
import { 
  ArrowLeftOutlined, 
  ThunderboltOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined,
  CreditCardOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { productService } from "../../services/productService";
import axiosInstance from "../../services/api";
import { orderService } from "../../services/orderService";

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const { cart, cartCount, refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isVoucherFreeShip, setIsVoucherFreeShip] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const getFullImageUrl = (url) => {
    if (!url) return "/images/placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    return `http://localhost:8080${pathOnly}`;
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fill form with user data if available
      form.setFieldsValue({
         shippingAddress: parsedUser.address || "",
         receiverPhone: parsedUser.phoneNumber || ""
      });
    } else {
      message.warning("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
    }
  }, [form, navigate]);

  const handleApplyVoucher = async () => {
    const code = form.getFieldValue("voucherCode");
    if (!code) return message.warning("Vui lòng nhập mã giảm giá");
    
    try {
      setApplyingVoucher(true);
      const response = await axiosInstance.get(`/vouchers/check/${code}`, {
        params: { totalAmount: cart.totalAmount }
      });
      
      const { discountAmount, isFreeShip } = response.data;
      setDiscountAmount(discountAmount);
      setIsVoucherFreeShip(isFreeShip);
      
      if (isFreeShip) {
        message.success(`Áp dụng mã thành công! Bạn được Miễn phí vận chuyển.`);
      } else if (discountAmount > 0) {
        message.success(`Áp dụng mã thành công! Đã giảm ${formatPrice(discountAmount)}`);
      } else {
        message.success(`Mã đã được ghi nhận.`);
      }
    } catch (error) {
      setDiscountAmount(0);
      setIsVoucherFreeShip(false);
      const errorMsg = error.response?.data?.message || error.response?.data || "Mã giảm giá không hợp lệ";
      message.error(errorMsg);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const onFinish = async (values) => {
    if (!user) return;
    if (loading) return; // Bảo vệ thêm một lớp nữa
    
    // Tạo message loading không tự động đóng
    const closeLoadingMsg = message.loading("Đang xử lý đơn hàng, vui lòng không tắt trình duyệt...", 0);
    
    try {
      setLoading(true);
      const orderData = {
        userId: user._id || user.id,
        shippingAddress: values.shippingAddress,
        receiverPhone: values.receiverPhone,
        paymentMethod: values.paymentMethod,
        voucherCode: values.voucherCode
      };

      const response = await orderService.createOrder(orderData);
      const { paymentUrl, orderCode } = response.data;

      closeLoadingMsg(); // Đóng message loading cũ
      message.success("Đặt hàng thành công!");

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        // COD order: Xóa giỏ hàng và chuyển hướng
        if (typeof refreshCart === 'function') refreshCart();
        navigate(`/payment/success?orderId=${orderCode}&isCod=true`);
      }
    } catch (error) {
      closeLoadingMsg(); // Đóng message loading nếu lỗi
      console.error("Order error:", error);
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Title level={4}>Giỏ hàng của bạn đang trống, không thể thanh toán.</Title>
        <Link to="/">
          <Button type="primary" className="mt-4 h-12 rounded-xl px-8 font-bold">QUAY LẠI MUA SẮM</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/cart">Giỏ hàng</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Thanh toán</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="!mb-8 font-bold uppercase tracking-tight">Thanh toán đơn hàng</Title>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{ paymentMethod: "MOMO" }}
        >
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left: Shipping Info */}
            <div className="col-span-12 lg:col-span-7">
              <Card className="rounded-3xl shadow-sm border-none mb-6">
                <Title level={4} className="!mb-6 flex items-center gap-2">
                  <EnvironmentOutlined className="text-primary" /> Thông tin nhận hàng
                </Title>
                
                <Form.Item 
                  name="receiverPhone" 
                  label="Số điện thoại người nhận"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Ví dụ: 0987654321" className="h-12 rounded-xl" />
                </Form.Item>
 
                <Form.Item 
                  name="shippingAddress" 
                  label="Địa chỉ giao hàng"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
                >
                  <Input.TextArea 
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" 
                    rows={4} 
                    className="rounded-xl p-4"
                  />
                </Form.Item>
              </Card>
 
              <Card className="rounded-3xl shadow-sm border-none">
                <Title level={4} className="!mb-6 flex items-center gap-2">
                  <CreditCardOutlined className="text-primary" /> Phương thức thanh toán
                </Title>
                
                <Form.Item name="paymentMethod">
                  <Radio.Group className="w-full space-y-4">
                    <Radio.Button value="MOMO" className="w-full !h-auto !py-4 !px-6 rounded-2xl border-primary border-2 flex items-center gap-4">
                       <div className="flex items-center gap-4">
                           <img src="https://static.mservice.io/img/logo-momo.png" className="h-8 rounded-lg" alt="momo" />
                          <div className="text-left">
                            <div className="font-bold text-gray-900">Thanh toán qua ví MoMo</div>
                            <div className="text-xs text-secondary italic">Hệ thống hỗ trợ thanh toán qua MoMo để đảm bảo an toàn giao dịch</div>
                          </div>
                       </div>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Card>
            </div>

            {/* Right: Order Summary */}
            <div className="col-span-12 lg:col-span-5">
              <Card className="rounded-3xl shadow-lg border-none">
                <Title level={4} className="!mb-6 uppercase text-sm font-bold text-gray-400 tracking-widest">Đơn hàng của bạn</Title>
                
                <div className="max-h-60 overflow-y-auto pr-2 mb-6 space-y-4 cart-items-mini">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg p-1 flex-shrink-0">
                        <img src={getFullImageUrl(item.productImage)} alt={item.productName} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900 truncate">{item.productName}</div>
                        <div className="text-[10px] text-gray-400 italic">SL: {item.quantity} x {formatPrice(item.price)}</div>
                      </div>
                      <div className="text-xs font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                <Divider className="my-6 border-gray-100" />
                
                <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                  <Form.Item name="voucherCode" label={<span className="text-xs font-bold uppercase text-gray-400">Mã giảm giá (Voucher)</span>} className="mb-0">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Nhập mã ưu đãi..." 
                            className="h-12 rounded-xl border-2 hover:border-primary transition-colors flex-1"
                        />
                        <Button 
                            type="primary"
                            ghost
                            onClick={handleApplyVoucher} 
                            loading={applyingVoucher}
                            className="h-12 rounded-xl font-bold uppercase text-xs px-6"
                        >
                            ÁP DỤNG
                        </Button>
                    </div>
                  </Form.Item>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center text-gray-500">
                      <span>Tạm tính ({cartCount} món)</span>
                      <span className="font-medium text-gray-900">{formatPrice(cart.totalAmount)}</span>
                   </div>
                   {discountAmount > 0 && (
                     <div className="flex justify-between items-center text-gray-500">
                        <span>Giảm giá</span>
                        <span className="text-green-500 font-bold">- {formatPrice(discountAmount)}</span>
                     </div>
                   )}
                   <div className="flex flex-col">
                     <div className="flex justify-between items-center text-gray-500">
                        <span>Phí vận chuyển</span>
                        <span className="text-green-500 font-bold">
                          {(cart.totalAmount >= 1000000 || isVoucherFreeShip) ? "Miễn phí" : formatPrice(30000)}
                        </span>
                     </div>
                     <span className="text-[10px] text-gray-400 italic text-right mt-1">
                       * Đơn hàng trên 1tr hoặc áp dụng Voucher Freeship sẽ được miễn phí vận chuyển
                     </span>
                   </div>
                   
                   <Divider className="my-6 border-gray-100" />
                   
                   <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                      <div className="text-right">
                         <div className="text-3xl font-bold text-red-600 leading-none">
                            {formatPrice(cart.totalAmount - discountAmount + ((cart.totalAmount >= 1000000 || isVoucherFreeShip) ? 0 : 30000))}
                         </div>
                         <Text type="secondary" className="text-[10px] uppercase font-bold tracking-tighter italic">Đã bao gồm VAT</Text>
                      </div>
                   </div>

                    <Button 
                    type="primary" 
                    danger 
                    size="large" 
                    icon={<ThunderboltOutlined />}
                    block 
                    loading={loading}
                    disabled={loading}
                    htmlType="submit"
                    className={`h-16 mt-8 rounded-2xl font-bold text-lg shadow-xl border-none transition-all ${loading ? 'opacity-70 grayscale cursor-not-allowed' : 'shadow-red-100 bg-gradient-to-r from-red-600 to-orange-500 hover:scale-[1.02]'}`}
                  >
                    {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                  </Button>
                  
                  <Link to="/cart" className="flex items-center justify-center gap-2 mt-4 text-gray-400 hover:text-primary transition-colors font-bold uppercase text-xs">
                     <ArrowLeftOutlined style={{ fontSize: '10px' }} /> Quay lại giỏ hàng
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CheckoutPage;
