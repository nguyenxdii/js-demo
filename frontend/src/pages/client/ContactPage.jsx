import React from "react";
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Form, 
  Input, 
  Button, 
  Space, 
  message 
} from "antd";
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  SendOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const ContactPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Contact Form Values:", values);
    message.success("Cảm ơn bạn! Lời nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.");
    form.resetFields();
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined className="text-2xl text-blue-500" />,
      title: "Điện thoại",
      content: "0348 345 247",
      subContent: "Hỗ trợ 24/7"
    },
    {
      icon: <MailOutlined className="text-2xl text-red-500" />,
      title: "Email",
      content: "contact@exeshop.vn",
      subContent: "Phản hồi trong 24h"
    },
    {
      icon: <EnvironmentOutlined className="text-2xl text-green-500" />,
      title: "Địa chỉ",
      content: "Số 1, Đường Đại Học, Thủ Đức, TP. Hồ Chí Minh",
      subContent: "Showroom chính thức"
    },
    {
      icon: <ClockCircleOutlined className="text-2xl text-orange-500" />,
      title: "Giờ làm việc",
      content: "08:00 - 21:00",
      subContent: "Thứ 2 - Chủ Nhật"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Title className="!mb-4 text-4xl font-black">Liên hệ với Sport Gear Studio</Title>
          <Paragraph className="text-lg text-gray-500 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Đừng ngần ngại liên hệ với Sport Gear Studio bất cứ khi nào bạn cần tư vấn về trang phục và dụng cụ tập luyện chuyên nghiệp.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {/* Contact Info Cards */}
          <Col xs={24} lg={10}>
            <div className="space-y-6">
              <Row gutter={[16, 16]}>
                {contactInfo.map((item, index) => (
                  <Col span={12} key={index}>
                    <Card className="rounded-3xl shadow-sm border-none hover:shadow-md transition-shadow h-full">
                      <div className="flex flex-col items-center text-center py-4">
                        <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                          {item.icon}
                        </div>
                        <Text strong className="block mb-1">{item.title}</Text>
                        <Text className="block text-sm font-bold text-gray-800">{item.content}</Text>
                        <Text type="secondary" className="text-xs">{item.subContent}</Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Social Media */}
              <Card className="rounded-3xl shadow-sm border-none mt-8 h-40 flex items-center justify-center">
                 <div className="text-center w-full">
                    <Text strong className="block mb-4 text-gray-400 uppercase tracking-widest text-xs font-bold">Kết nối với chúng tôi</Text>
                    <Space size="large">
                       <Button shape="circle" icon={<FacebookOutlined />} size="large" className="hover:text-blue-600" />
                       <Button shape="circle" icon={<YoutubeOutlined />} size="large" className="hover:text-red-600" />
                       <Button shape="circle" icon={<InstagramOutlined />} size="large" className="hover:text-pink-600" />
                    </Space>
                 </div>
              </Card>
            </div>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card className="rounded-[40px] shadow-xl border-none p-4 md:p-8 h-full">
              <Title level={3} className="mb-8">Gửi lời nhắn cho chúng tôi</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                requiredMark={false}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label={<Text strong className="text-gray-600">Họ và tên</Text>}
                      rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                      <Input placeholder="Nguyễn Văn A" className="rounded-xl border-gray-100 bg-gray-50 hover:bg-white focus:bg-white transition-all" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label={<Text strong className="text-gray-600">Email</Text>}
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" }
                      ]}
                    >
                      <Input placeholder="example@gmail.com" className="rounded-xl border-gray-100 bg-gray-50 hover:bg-white focus:bg-white transition-all" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="subject"
                  label={<Text strong className="text-gray-600">Tiêu đề</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                  <Input placeholder="Tôi cần tư vấn chọn giày chạy bộ..." className="rounded-xl border-gray-100 bg-gray-50 hover:bg-white focus:bg-white transition-all" />
                </Form.Item>

                <Form.Item
                  name="message"
                  label={<Text strong className="text-gray-600">Nội dung câu hỏi</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                >
                  <Input.TextArea 
                    rows={5} 
                    placeholder="Nhập chi tiết yêu cầu của bạn tại đây..." 
                    className="rounded-2xl border-gray-100 bg-gray-50 hover:bg-white focus:bg-white transition-all"
                  />
                </Form.Item>

                <Form.Item className="mb-0 mt-8">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SendOutlined />} 
                    className="h-14 px-10 rounded-2xl bg-black hover:!bg-gray-800 text-white border-none text-lg font-bold shadow-lg"
                  >
                    GỬI LỜI NHẮN
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Google Maps Mockup */}
        <div className="mt-20 overflow-hidden rounded-[40px] shadow-2xl h-[400px] relative">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
            alt="Showroom Map" 
            className="w-full h-full object-cover grayscale opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <Card className="rounded-3xl shadow-2xl p-6 text-center max-w-sm border-none">
               <EnvironmentOutlined className="text-4xl text-blue-500 mb-4" />
               <Title level={4} className="!mb-2">Showroom Sport Gear Studio</Title>
               <Text type="secondary">Số 1, Đường Đại Học, Thủ Đức</Text>
               <div className="mt-4">
                  <Button type="primary" className="rounded-xl" href="https://maps.google.com" target="_blank">Xem trên Google Maps</Button>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
