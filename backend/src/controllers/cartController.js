const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCartByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        
        const cartObj = cart.toObject();
        cartObj.id = cartObj._id;
        let totalAmount = 0;
        cartObj.items = cartObj.items.map(item => {
            const price = item.product?.price || 0;
            totalAmount += price * item.quantity;
            return {
                ...item,
                id: item._id,
                productName: item.product?.name,
                productImage: item.product?.mainImageUrl,
                productSlug: item.product?.slug,
                price: price,
            };
        });
        cartObj.totalAmount = totalAmount;

        res.json(cartObj);
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const { userId, productId: rawProductId, quantity } = req.body;
        const targetUserId = userId || req.user?._id;

        // Trích xuất ID nếu productId là một object
        const productId = (typeof rawProductId === 'object' && rawProductId?._id) 
            ? rawProductId._id.toString() 
            : rawProductId?.toString();

        if (!targetUserId) {
            res.status(401);
            throw new Error('User ID is required');
        }

        if (!productId) {
            res.status(400);
            throw new Error('Product ID is required');
        }

        const product = await Product.findById(productId);
        if (!product) {
            res.status(404);
            throw new Error('Sản phẩm không tồn tại');
        }

        let cart = await Cart.findOne({ user: targetUserId });
        if (!cart) {
            cart = new Cart({ user: targetUserId, items: [] });
        }

        const existItemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );
        const newQuantity = (existItemIndex > -1 ? cart.items[existItemIndex].quantity : 0) + Number(quantity);

        if (newQuantity > product.stock) {
            res.status(400);
            throw new Error(`Sản phẩm này chỉ còn ${product.stock} trong kho. Bạn đã có ${existItemIndex > -1 ? cart.items[existItemIndex].quantity : 0} trong giỏ hàng.`);
        }

        if (existItemIndex > -1) {
            cart.items[existItemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity: Number(quantity) });
        }

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        const cartObj = updatedCart.toObject();
        cartObj.id = cartObj._id;
        let totalAmount = 0;
        cartObj.items = cartObj.items.map(item => {
            const price = item.product?.price || 0;
            totalAmount += price * item.quantity;
            return {
                ...item,
                id: item._id,
                productName: item.product?.name,
                productImage: item.product?.mainImageUrl,
                productSlug: item.product?.slug,
                price: price,
            };
        });
        cartObj.totalAmount = totalAmount;
        res.status(201).json(cartObj);
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.query; // Quantity vẫn lấy từ query hoặc body
        const targetUserId = req.user?._id;

        if (!targetUserId) {
            res.status(401);
            throw new Error('Bạn cần đăng nhập để cập nhật giỏ hàng');
        }

        const cart = await Cart.findOne({ user: targetUserId });
        
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
            if (itemIndex > -1) {
                if (Number(quantity) <= 0) {
                    cart.items.splice(itemIndex, 1);
                } else {
                    const product = await Product.findById(cart.items[itemIndex].product);
                    if (product && Number(quantity) > product.stock) {
                        res.status(400);
                        throw new Error(`Số lượng yêu cầu (${quantity}) vượt quá tồn kho hiện có (${product.stock}).`);
                    }
                    cart.items[itemIndex].quantity = Number(quantity);
                }
                await cart.save();
                const updatedCart = await Cart.findById(cart._id).populate('items.product');
                const cartObj = updatedCart.toObject();
                cartObj.id = cartObj._id;
                let totalAmount = 0;
                cartObj.items = cartObj.items.map(item => {
                    const price = item.product?.price || 0;
                    totalAmount += price * item.quantity;
                    return {
                        ...item,
                        id: item._id,
                        productName: item.product?.name,
                        productImage: item.product?.mainImageUrl,
                        productSlug: item.product?.slug,
                        price: price,
                    };
                });
                cartObj.totalAmount = totalAmount;
                res.json(cartObj);
            } else {
                res.status(404);
                throw new Error('Sản phẩm không có trong giỏ hàng');
            }
        } else {
            res.status(404);
            throw new Error('Giỏ hàng trống');
        }
    } catch (error) {
        next(error);
    }
};

const removeCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const targetUserId = req.user?._id;

        if (!targetUserId) {
            res.status(401);
            throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
        }

        const cart = await Cart.findOne({ user: targetUserId });
        if (cart) {
            cart.items = cart.items.filter(item => item._id.toString() !== itemId);
            await cart.save();
            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            const cartObj = updatedCart.toObject();
            cartObj.id = cartObj._id;
            let totalAmount = 0;
            cartObj.items = cartObj.items.map(item => {
                const price = item.product?.price || 0;
                totalAmount += price * item.quantity;
                return {
                    ...item,
                    id: item._id,
                    productName: item.product?.name,
                    productImage: item.product?.mainImageUrl,
                    productSlug: item.product?.slug,
                    price: price,
                };
            });
            cartObj.totalAmount = totalAmount;
            res.json(cartObj);
        } else {
            res.status(404);
            throw new Error('Giỏ hàng trống');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCartByUserId,
    addToCart,
    updateCartItem,
    removeCartItem,
};
