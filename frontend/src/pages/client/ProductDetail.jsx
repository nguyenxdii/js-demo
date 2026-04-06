import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Tag,
  Typography,
  Divider,
  InputNumber,
  Space,
  Tabs,
  message,
  Skeleton,
  Rate,
  Input,
  Avatar,
  Card,
} from "antd";
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  TruckOutlined,
  UserOutlined,
  SendOutlined,
  CommentOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");
import { productService } from "../../services/productService";
import { commentService } from "../../services/commentService";
import { useCart } from "../../contexts/CartContext";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [user, setUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    if (cleanUrl.startsWith("/uploads") || cleanUrl.startsWith("uploads")) {
        const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
        return `http://localhost:8080${pathOnly}`;
    }
    return cleanUrl;
  };

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product._id, quantity);
    navigate("/cart");
  };

  useEffect(() => {
    const fetchProductAndComments = async () => {
      setLoading(true);
      try {
        const prodData = await productService.getProductBySlug(slug);
        if (!prodData) throw new Error("Product data is null");
        setProduct(prodData);
        setActiveImage(getFullImageUrl(prodData.mainImageUrl));
        
        // Secondary data loads (doesn't trigger "Product Not Found" if failed)
        const fetchSecondaryData = async () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                   const parsedUser = JSON.parse(userData);
                   setUser(parsedUser);
                   const eligible = await commentService.checkEligibility(parsedUser._id || parsedUser.id, prodData._id);
                   setIsEligible(eligible);
                } catch (e) { console.error("Eligibility check failed:", e); }
            }

            try {
               const commentData = await commentService.getCommentsByProductId(prodData._id);
               setComments(commentData);
            } catch (e) { console.error("Comments load failed:", e); }
        };
        
        fetchSecondaryData();
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        message.warning("Hiện tại không thể tải thông tin sản phẩm. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndComments();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    // Tự động kích hoạt phản hồi nếu có tham số replyTo từ Dashboard
    const searchParams = new URLSearchParams(location.search);
    const replyId = searchParams.get("replyTo");
    
    if (replyId && comments.length > 0) {
        const targetId = replyId;
        const findComment = (list) => {
            for (const c of list) {
                if (c._id === targetId) return c;
                if (c.replies) {
                    const found = findComment(c.replies);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetComment = findComment(comments);
        if (targetComment) {
            setReplyingTo(targetComment);
            setTimeout(() => {
                const element = document.getElementById(`comment-${targetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Hiệu ứng nhấp nháy để Admin nhận diện
                    element.classList.add('animate-pulse');
                    setTimeout(() => element.classList.remove('animate-pulse'), 3000);
                }
            }, 1200);
        }
    }
  }, [comments, location]);

  const handlePostComment = async () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }
    if (!newComment.trim()) {
      message.warning("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    setSubmitting(true);
    try {
      await commentService.addComment({
        content: newComment,
        rating: replyingTo ? null : rating,
        productId: product._id,
        userId: user._id || user.id,
        parentCommentId: replyingTo ? replyingTo._id : null
      });
      message.success(replyingTo ? "Gửi phản hồi thành công!" : "Cảm ơn bạn đã đánh giá!");
      setNewComment("");
      setReplyingTo(null);
      
      // Refresh comments im lặng (nếu lỗi cũng không báo "Gửi thất bại")
      try {
        const commentData = await commentService.getCommentsByProductId(product._id);
        setComments(commentData);
      } catch (err) {
        console.error("Lỗi khi tải lại bình luận:", err);
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      message.error("Gửi bình luận thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton active />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Title level={3}>Sản phẩm không tồn tại hoặc đã bị xóa!</Title>
        <Link to="/">
          <Button type="primary">Quay về trang chủ</Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const CommentItem = ({ 
    comment, 
    isReply = false, 
    user, 
    replyingTo, 
    setReplyingTo, 
    newComment, 
    setNewComment, 
    submitting, 
    handlePostComment,
    location,
    parentAuthorId = null
  }) => {
    const isTargeted = String(location.hash) === `#comment-${comment._id}` || 
                       String(new URLSearchParams(location.search).get("replyTo")) === String(comment._id);

    const userName = comment.user?.fullName || comment.userName || "Khách";
    const userRole = comment.user?.role || (comment.userName === 'Admin' ? 'ADMIN' : 'USER');
    const userAvatar = comment.user?.avatarUrl || comment.userAvatar;
    const isPurchased = comment.isPurchased;
    const purchasedDate = comment.purchasedDate;
    
    const currentUserId = String(user?._id || user?.id || "");
    const originalAuthorId = String(parentAuthorId || "");
    
    // Logic: 
    // 1. Admin: Can reply to everyone
    // 2. User: Only can reply back to Admin if Admin replied to their comment
    const canReply = user && (
        user.role === 'ADMIN' || 
        (user.role === 'USER' && isReply && userRole === 'ADMIN' && originalAuthorId === currentUserId)
    );

    return (
        <div 
          id={`comment-${comment._id}`} 
          className={`mb-6 p-4 rounded-3xl transition-all duration-1000 ${
            isReply ? "ml-12 border-l-2 border-gray-100 pl-6" : ""
          } ${isTargeted ? "ring-2 ring-orange-400 bg-orange-50 shadow-lg scale-[1.01]" : ""}`}
        >
          <div className="flex gap-4 mb-2">
            <Avatar 
                src={getFullImageUrl(userAvatar)}
                icon={!userAvatar && <UserOutlined />} 
                className="bg-blue-500 shadow-sm border border-white" 
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Text strong className="text-gray-900">{userName}</Text>
                <Text type="secondary" className="text-xs">
                  {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </div>
              
              {comment.rating && <Rate disabled defaultValue={comment.rating} className="text-[10px] mb-2" />}
              
              {/* Badge: Đã mua hàng */}
              {comment.isPurchased && (
                <div className="mb-2">
                  <Tag color="success" icon={<SafetyCertificateOutlined />} className="rounded-full px-3 py-0.5 border-none bg-green-50 text-green-600 font-bold text-[10px]">
                    ĐÃ MUA HÀNG VÀO {new Date(comment.purchasedDate).toLocaleDateString("vi-VN")}
                  </Tag>
                </div>
              )}

              <div className="bg-white/50 p-4 rounded-2xl relative border border-gray-100/50 shadow-sm">
                <Paragraph className="mb-0 text-gray-700 leading-relaxed">{comment.content}</Paragraph>
                
                {/* Reply Button conditionally displayed */}
                {canReply && (
                    <Button 
                        type="link" 
                        size="small" 
                        className="mt-2 p-0 text-primary font-bold text-xs flex items-center gap-1 hover:text-orange-600"
                        onClick={() => {
                            setNewComment(`@${userName} `);
                            setReplyingTo(comment);
                        }}
                    >
                        <SendOutlined className="rotate-[-45deg]" /> PHẢN HỒI
                    </Button>
                )}
              </div>

              {/* Inline Reply Form for Everyone when replyingTo */}
              {user && replyingTo?._id === comment._id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                      <TextArea
                          autoFocus
                          onFocus={(e) => {
                              const val = e.target.value;
                              e.target.value = '';
                              e.target.value = val;
                          }}
                          rows={3}
                          placeholder={`Phản hồi cho ${userName}...`}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="rounded-xl border-gray-200 mb-2 focus:shadow-md transition-shadow"
                      />
                      <div className="flex gap-2 mt-3">
                          <Button 
                              type="primary" 
                              size="small" 
                              loading={submitting} 
                              onClick={handlePostComment}
                              className="rounded-lg px-6 font-bold"
                          >
                              Gửi phản hồi
                          </Button>
                          <Button 
                              size="small" 
                              onClick={() => {
                                  setReplyingTo(null);
                                  setNewComment("");
                              }}
                              className="rounded-lg px-6 border-gray-300"
                          >
                              Hủy
                          </Button>
                      </div>
                  </div>
              )}
            </div>
          </div>
          {comment.replies && comment.replies.length > 0 && comment.replies.map(reply => (
            <CommentItem 
                key={reply._id} 
                comment={reply} 
                isReply 
                user={user}
                parentAuthorId={comment.user?._id || comment.user?.id}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                newComment={newComment}
                setNewComment={setNewComment}
                submitting={submitting}
                handlePostComment={handlePostComment}
                location={location}
            />
          ))}
        </div>
    );
  };

  const tabsItems = [
    {
      key: "1",
      label: "Mô tả chi tiết",
      children: (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 min-h-[300px] shadow-sm">
          <Paragraph className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </Paragraph>
        </div>
      ),
    },
    {
      key: "2",
      label: "Thông số kỹ thuật",
      children: (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 min-h-[300px] shadow-sm">
           <table className="w-full text-[15px]">
              <tbody>
                 <tr className="border-b border-gray-50">
                    <td className="py-5 font-bold text-gray-400 w-1/3 uppercase tracking-wider text-xs">Thương hiệu</td>
                    <td className="py-5 text-gray-900 font-semibold">{product.brand?.name}</td>
                 </tr>
                 <tr className="border-b border-gray-50">
                    <td className="py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Mã sản phẩm (SKU)</td>
                    <td className="py-5 text-gray-900 font-semibold">{product.sku}</td>
                 </tr>
                 <tr className="border-b border-gray-50">
                    <td className="py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Danh mục</td>
                    <td className="py-5 text-gray-900 font-semibold">{product.category?.name}</td>
                 </tr>
                 <tr>
                    <td className="py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Trạng thái kho</td>
                    <td className="py-5 font-semibold">
                       <Tag color={product.stock > 0 ? "success" : "error"} className="rounded-full px-4">
                          {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
                       </Tag>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <Space>
          <CommentOutlined /> Đánh giá ({comments.length})
        </Space>
      ),
      children: (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          {/* Post Comment Form */}
          <div className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <Title level={4} className="!mb-6">Gửi nhận xét của bạn</Title>
            
            <div className="mb-4 flex items-center gap-4">
                <Text className="font-bold text-gray-600 uppercase text-xs tracking-widest min-w-[120px]">Đánh giá của bạn:</Text>
                <Rate value={rating} onChange={setRating} className="text-2xl" />
            </div>

            <TextArea
              rows={4}
              placeholder="Nhập nội dung đánh giá của bạn tại đây..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="rounded-xl p-4 border-none shadow-sm focus:shadow-md transition-shadow bg-white text-lg"
            />
            <div style={{ marginTop: '24px' }} className="flex justify-start">
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handlePostComment}
                    loading={submitting}
                    className="h-12 px-10 font-bold rounded-xl"
                >
                    GỬI ĐÁNH GIÁ
                </Button>
            </div>
          </div>

          <Divider />

          {/* Comments List */}
          <div className="mt-8">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem 
                    key={comment._id} 
                    comment={comment} 
                    user={user}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    submitting={submitting}
                    handlePostComment={handlePostComment}
                    location={location}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <Text type="secondary" className="italic">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6 breadcrumb-premium" items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/products" className="opacity-70 hover:opacity-100 font-medium">Sản phẩm</Link> },
          { title: (
            <Link 
              to={`/products?category=${product.category?._id || product.category?.id}`} 
              className="opacity-70 hover:opacity-100 hover:text-orange-500 transition-all font-medium"
            >
              {product.category?.name}
            </Link>
          ) },
          { title: <span className="text-gray-900 font-bold">{product.name}</span> }
        ]} />

        <div className="grid grid-cols-12 gap-10">
          {/* Left: Product Image */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
              <div className="relative aspect-square mb-4">
                <img
                  src={activeImage || "/images/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Image Gallery Thumbnails */}
              {product.secondaryImages && product.secondaryImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <div 
                    onClick={() => setActiveImage(getFullImageUrl(product.mainImageUrl))}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 cursor-pointer overflow-hidden transition-all ${
                      activeImage === getFullImageUrl(product.mainImageUrl) ? "border-primary shadow-md" : "border-gray-100 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={getFullImageUrl(product.mainImageUrl)} className="w-full h-full object-cover" alt="Main" />
                  </div>
                  {product.secondaryImages.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveImage(getFullImageUrl(img))}
                      className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 cursor-pointer overflow-hidden transition-all ${
                        activeImage === getFullImageUrl(img) ? "border-primary shadow-md" : "border-gray-100 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={getFullImageUrl(img)} className="w-full h-full object-cover" alt={`Secondary ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
              <div className="mb-4">
                <Tag color="red" className="rounded-full px-3 mb-2">HOT</Tag>
                <Tag color="blue" className="rounded-full px-3 mb-2">{product.brand?.name}</Tag>
              </div>
              
              <Title level={2} className="!mb-2 !text-3xl font-bold text-gray-900">
                {product.name}
              </Title>
              
              <div className="flex items-center gap-4 mb-6">
                <Text type="secondary" className="text-sm">SKU: <span className="text-gray-900 font-bold">{product.sku}</span></Text>
                <Divider type="vertical" />
                <Text type="secondary" className="text-sm">Trình trạng: 
                   <span className={product.stock > 0 ? "text-green-600 font-bold ml-1" : "text-red-600 font-bold ml-1"}>
                      {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                   </span>
                </Text>
              </div>

              <div className="bg-red-50 p-6 rounded-2xl mb-8 relative overflow-hidden">
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="flex items-center gap-3 mb-1">
                    <Text delete className="text-gray-400 text-lg">
                      {formatPrice(product.oldPrice)}
                    </Text>
                    <Tag color="red" className="rounded-full font-bold border-none px-3 bg-red-500 text-white animate-pulse">
                      -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </Tag>
                  </div>
                )}
                <div className="text-red-600 font-bold text-4xl mb-1">
                  {formatPrice(product.price)}
                </div>
                <Text type="secondary" className="text-[10px] italic uppercase tracking-wider opacity-70">
                  Giá đã bao gồm thuế VAT và phí môi trường
                </Text>
                
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                   <ShoppingCartOutlined style={{ fontSize: '100px' }} />
                </div>
              </div>

              <div className="mb-8">
                <Text strong className="block mb-3 text-lg">Số lượng</Text>
                <Space size="large">
                  <InputNumber
                    min={1}
                    max={product.stock || 1}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                    className="rounded-lg w-24"
                  />
                  <Text type="secondary">{product.stock} sản phẩm có sẵn</Text>
                </Space>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <Button
                  type="primary"
                  danger
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={handleBuyNow}
                  loading={cartLoading}
                  className="h-14 font-bold text-lg rounded-xl shadow-lg border-none bg-gradient-to-r from-red-600 to-orange-500 hover:scale-[1.02] transition-transform"
                >
                  MUA NGAY
                </Button>
                <Button
                  ghost
                  danger
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  loading={cartLoading}
                  className="h-14 font-bold text-lg rounded-xl border-2 hover:scale-[1.02] transition-transform"
                >
                  THÊM VÀO GIỎ
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-y-4 border-t pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                     <SafetyCertificateOutlined />
                  </div>
                  <Text className="text-sm font-semibold">Chính hãng 100%</Text>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                     <SyncOutlined />
                  </div>
                  <Text className="text-sm font-semibold">Đổi trả trong 7 ngày</Text>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                     <TruckOutlined />
                  </div>
                  <Text className="text-sm font-semibold">Giao hàng miễn phí</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="mt-12">
          <Tabs
            defaultActiveKey="1"
            items={tabsItems}
            className="detail-tabs custom-tabs"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
