import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Result, Button, Card, Typography, Spin, Space } from "antd";
import { CheckCircleFilled, CloseCircleFilled, ShoppingOutlined, HomeOutlined } from "@ant-design/icons";
import { orderService } from "../../services/orderService";
import { useCart } from "../../contexts/CartContext";

const { Title, Text } = Typography;

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [orderCode, setOrderCode] = useState("");
  const { refreshCart } = useCart();

  useEffect(() => {
    const verifyPayment = async () => {
      const resultCode = searchParams.get("resultCode");
      const orderId = searchParams.get("orderId");
      setOrderCode(orderId);

      try {
        // Gọi backend để cập nhật trạng thái thực tế từ MoMo
        if (orderId) {
          await orderService.checkStatus(orderId);
        }
        
        if (resultCode === "0") {
          setStatus("success");
          // Refresh giỏ hàng sau khi thanh toán thành công
          if (typeof refreshCart === 'function') refreshCart();
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Lỗi xác thực thanh toán:", error);
        // Nếu resultCode = 0 thì vẫn hiện success dù check-status lỗi
        if (resultCode === "0") {
          setStatus("success");
          if (typeof refreshCart === 'function') refreshCart();
        } else {
          setStatus("error");
        }
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-center">
        <Space direction="vertical" size="large">
            <Spin size="large" />
            <Text>Đang xử lý thông tin thanh toán...</Text>
        </Space>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="rounded-3xl shadow-xl border-none overflow-hidden">
          {status === "success" ? (
            <Result
              status="success"
              title={<span className="text-2xl font-black text-gray-900 uppercase">Thanh toán thành công!</span>}
              subTitle={
                <div className="space-y-2 mt-4">
                  <Text className="text-lg">Đơn hàng <span className="font-bold text-primary">{orderCode}</span> đã được thanh toán và đang được xử lý.</Text>
                  <br />
                  <Text type="secondary">Cảm ơn bạn đã tin tưởng và mua sắm tại Sport Gear Studio.</Text>
                </div>
              }
              extra={[
                <Link to="/orders" key="orders">
                  <Button type="primary" size="large" className="h-12 px-8 rounded-xl font-bold bg-primary border-none shadow-lg">
                    XEM ĐƠN HÀNG
                  </Button>
                </Link>,
                <Link to="/" key="home">
                  <Button size="large" className="h-12 px-8 rounded-xl font-bold hover:text-primary hover:border-primary">
                    TRANG CHỦ
                  </Button>
                </Link>
              ]}
            />
          ) : (
            <Result
              status="error"
              title={<span className="text-2xl font-black text-gray-900 uppercase">Thanh toán thất bại</span>}
              subTitle={
                <div className="space-y-2 mt-4">
                  <Text className="text-lg">Giao dịch cho đơn hàng <span className="font-bold text-primary">{orderCode}</span> không thành công hoặc đã bị hủy.</Text>
                  <br />
                  <Text type="secondary">Vui lòng kiểm tra lại số dư ví MoMo hoặc thử lại sau.</Text>
                </div>
              }
              extra={[
                <Link to="/cart" key="retry">
                  <Button type="primary" danger size="large" className="h-12 px-8 rounded-xl font-bold border-none shadow-lg">
                    THỬ LẠI
                  </Button>
                </Link>,
                <Link to="/" key="home">
                   <Button size="large" className="h-12 px-8 rounded-xl font-bold">
                    QUAY LẠI TRANG CHỦ
                  </Button>
                </Link>
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PaymentReturn;
