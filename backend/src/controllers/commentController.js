const Comment = require('../models/Comment');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getAllAdmin = async (req, res, next) => {
    try {
        const comments = await Comment.find({})
            .populate('user', 'fullName avatarUrl role')
            .populate('product', 'name slug')
            .sort({ createdAt: -1 });
            
        const filteredComments = comments.filter(c => c.user?.role !== 'ADMIN');

        const mapped = filteredComments.map(c => ({
            id: c._id,
            content: c.content,
            rating: c.rating,
            userName: c.user?.fullName || "Khách",
            userAvatar: c.user?.avatarUrl || null,
            productName: c.product?.name || "Sản phẩm đã xóa",
            productSlug: c.product?.slug || null,
            createdAt: c.createdAt,
            replies: c.replies || [],
        }));
        res.json(mapped);
    } catch (error) {
        next(error);
    }
};

const getCommentsByProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const comments = await Comment.find({ product: productId, parentComment: null })
            .populate('user', 'fullName avatarUrl')
            .populate({
                path: 'replies',
                populate: { path: 'user', select: 'fullName avatarUrl' }
            })
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        next(error);
    }
};

const createComment = async (req, res, next) => {
    try {
        const { content, rating, parentCommentId } = req.body;
        const productId = req.body.product || req.body.productId;
        const userId = req.user._id;

        // Kiểm tra xem User đã mua sản phẩm này chưa
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: { $in: ['PAID', 'DELIVERED'] }
        }).sort({ createdAt: -1 });

        const comment = new Comment({
            content,
            rating,
            product: productId,
            user: userId,
            parentComment: parentCommentId || null,
            isPurchased: !!hasPurchased,
            purchasedDate: hasPurchased ? hasPurchased.createdAt : null
        });

        const savedComment = await comment.save();

        // Nếu là bình luận gốc (có rating), cập nhật rating trung bình cho sản phẩm
        if (!parentCommentId && rating) {
            const Product = require('../models/Product');
            const product = await Product.findById(productId);
            if (product) {
                const comments = await Comment.find({ product: productId, parentComment: null });
                const totalReviews = comments.length;
                const averageRating = comments.reduce((acc, c) => acc + (c.rating || 0), 0) / totalReviews;
                
                product.totalReviews = totalReviews;
                product.averageRating = Math.round(averageRating * 10) / 10;
                await product.save();
            }
        }

        // Nếu là reply, add vào mảng replies của comment cha
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: savedComment._id } });
        }

        const fullComment = await Comment.findById(savedComment._id)
            .populate('user', 'fullName avatarUrl')
            .populate('product', 'name');

        // Tạo thông báo cho Admin
        const Notification = require('../models/Notification');
        await Notification.create({
            title: parentCommentId ? 'Phản hồi bình luận mới' : 'Đánh giá sản phẩm mới',
            message: `${fullComment.user?.fullName} đã ${parentCommentId ? 'phản hồi' : 'đánh giá ' + rating + ' sao'} cho sản phẩm "${fullComment.product?.name}": "${content.substring(0, 50)}..."`,
            type: 'USER',
            link: '/admin/comments',
            relatedId: savedComment._id
        });

        res.status(201).json(fullComment);
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404);
            throw new Error('Bình luận không tồn tại');
        }
        
        // Chỉ admin hoặc chủ nhân bình luận mới được xóa
        if (req.user.role !== 'ADMIN' && comment.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Không có quyền xóa bình luận này');
        }

        await comment.deleteOne();
        res.json({ message: 'Đã xóa bình luận' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAdmin,
    getCommentsByProduct,
    createComment,
    deleteComment
};
