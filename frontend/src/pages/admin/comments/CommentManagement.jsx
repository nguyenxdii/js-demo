import React, { useState, useEffect } from "react";
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Input, 
  message, 
  Rate,
  Avatar
} from "antd";
import { 
  MessageOutlined, 
  UserOutlined,
  SendOutlined,
  CommentOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { commentService } from "../../../services/commentService";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CommentManagement = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getAllAdmin();
      // Filter out replies from main table, or show all - let's show only root comments in the main table
      const rootComments = data.filter(c => !c.parentId); // Backend might need to provide parentId in response
      // For now, let's assume we show everything or logic to identify roots
      setComments(data.filter(c => !data.some(parent => parent.replies?.some(r => r.id === c.id))));
      
      // Actually, my convertToResponse handles nesting. So root comments are what I need.
      // Since getAllAdmin returns all, I should only take those that are NOT in any 'replies' list.
      // But standard way is to return root comments with nested replies.
      setComments(data); 
    } catch (error) {
      message.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const showReplyModal = (comment) => {
    setSelectedComment(comment);
    setIsModalVisible(true);
    setReplyContent("");
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSubmittingReply(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      await commentService.addComment({
        content: replyContent,
        productId: selectedComment.productId,
        userId: userData.id,
        parentCommentId: selectedComment.id,
        rating: null // Replies don't have ratings
      });
      message.success("Đã gửi phản hồi thành công");
      setIsModalVisible(false);
      fetchComments();
    } catch (error) {
      message.error("Gửi phản hồi thất bại");
    } finally {
      setSubmittingReply(false);
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 250,
      render: (text) => (
        <div style={{ minWidth: "150px" }}>
            <Text strong className="text-gray-900 border-l-4 border-red-500 pl-3 leading-tight block">
                {text}
            </Text>
            <Text type="secondary" className="text-[10px] pl-3">Sản phẩm hệ thống</Text>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "userName",
      key: "userName",
      width: 250,
      render: (text, record) => (
        <Space size="small">
          <Avatar 
            size={36} 
            src={record.userAvatar}
            icon={!record.userAvatar && <UserOutlined />} 
            className="bg-blue-500 shadow-sm border border-gray-100" 
          />
          <div className="flex flex-col">
            <Text strong className="text-gray-800 text-sm whitespace-nowrap">{text}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => (
        <div className="flex flex-col items-start gap-1">
            {rating ? (
                <div className="flex items-center gap-2">
                    <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} className="text-orange-400" />
                    <Text type="secondary" className="text-[10px] whitespace-nowrap pt-1">({rating} / 5)</Text>
                </div>
            ) : (
                <Tag color="cyan" className="rounded-full border-none px-3 py-0.5 text-[10px] font-bold uppercase">Hỏi đáp</Tag>
            )}
        </div>
      ),
    },
    {
      title: "Nội dung nhận xét",
      dataIndex: "content",
      key: "content",
      render: (text) => (
        <Paragraph ellipsis={{ rows: 2 }} className="!mb-0 italic text-gray-500 bg-gray-50/50 p-2 rounded-lg border border-gray-100 min-w-[200px]">
            "{text}"
        </Paragraph>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => (
          <div className="flex flex-col bg-gray-50/50 p-2 rounded-lg border border-gray-100 items-center justify-center min-w-[130px]">
              <Text className="text-gray-800 font-bold text-xs">{new Date(date).toLocaleDateString("vi-VN")}</Text>
              <Text className="text-blue-500 font-medium text-[11px] mt-0.5">{new Date(date).toLocaleTimeString("vi-VN")}</Text>
          </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
          <Tag 
            className="rounded-full px-4 py-1 border-none shadow-sm font-black text-[10px] flex items-center gap-1 justify-center"
            color={record.replies && record.replies.length > 0 ? "success" : "warning"}
          >
            {record.replies && record.replies.length > 0 ? "✓ ĐÃ PHẢN HỒI" : "⏲ CHỜ ADMIN"}
          </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<MessageOutlined />} 
          onClick={() => {
            if (record.productSlug) {
                const url = `/product/${record.productSlug}?replyTo=${record.id}#comment-${record.id}`;
                window.open(url, "_blank");
            } else {
                message.warning("Không tìm thấy thông tin sản phẩm");
            }
          }}
          size="small"
          className="rounded-lg shadow-sm text-[11px] font-bold"
        >
          PHẢN HỒI
        </Button>
      ),
    },
  ];


  return (
    <div className="p-6">
      <Card 
        title={
          <Space>
            <CommentOutlined className="text-primary text-xl" />
            <Title level={4} className="!mb-0">Quản lý Đánh giá & Bình luận</Title>
          </Space>
        }
        className="shadow-sm rounded-xl border-none"
      >
        <Table 
          columns={columns} 
          dataSource={comments} 
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          className="shadow-sm"
        />
      </Card>

      <Modal
        title="Chi tiết & Phản hồi đánh giá"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submittingReply} 
            onClick={handleReply}
            icon={<SendOutlined />}
            danger
          >
            Gửi phản hồi
          </Button>,
        ]}
        width={700}
      >
        {selectedComment && (
          <div className="flex flex-col gap-6 py-4">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <Space>
                  <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                  <div>
                    <Text strong className="block">{selectedComment.userName}</Text>
                    <Text type="secondary" className="text-xs">{new Date(selectedComment.createdAt).toLocaleString("vi-VN")}</Text>
                  </div>
                </Space>
                {selectedComment.rating && (
                  <div className="flex flex-col items-end">
                    <Rate disabled defaultValue={selectedComment.rating} />
                    <Text type="secondary" className="text-xs italic">{selectedComment.rating} / 5 sao</Text>
                  </div>
                )}
              </div>
              <Paragraph className="text-gray-700 text-lg italic mb-0">
                "{selectedComment.content}"
              </Paragraph>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Sản phẩm:</Text>
                <div className="text-blue-600 font-bold">{selectedComment.productName}</div>
              </div>
            </div>

            {selectedComment.replies && selectedComment.replies.length > 0 && (
              <div className="space-y-4">
                <Text strong className="text-gray-400 uppercase text-xs tracking-widest">Lịch sử phản hồi</Text>
                {selectedComment.replies.map(reply => (
                  <div key={reply.id} className="ml-8 bg-blue-50 p-4 rounded-xl border border-blue-100 relative">
                     <div className="absolute -left-4 top-4 w-4 h-[2px] bg-blue-100"></div>
                     <div className="flex justify-between mb-1">
                        <Text strong className="text-blue-800">{reply.userName}</Text>
                        <Text type="secondary" className="text-xs">{new Date(reply.createdAt).toLocaleString("vi-VN")}</Text>
                     </div>
                     <Paragraph className="mb-0 text-gray-700">{reply.content}</Paragraph>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Text strong className="block mb-2 text-gray-600">Nhập phản hồi của bạn:</Text>
              <TextArea
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nội dung phản hồi dành cho khách hàng..."
                className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommentManagement;
