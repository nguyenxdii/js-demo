import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/cartService";
import { message } from "antd";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart khi mount nếu đã đăng nhập
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCart();
    }
  }, [fetchCart]);

  // Lắng nghe sự kiện login/logout để sync giỏ hàng
  useEffect(() => {
    const handleUserLogin = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
        fetchCart();
      }
    };

    const handleUserLogout = () => {
      setUser(null);
      setCart({ items: [], totalAmount: 0 });
    };

    window.addEventListener("user-login", handleUserLogin);
    window.addEventListener("user-logout", handleUserLogout);

    return () => {
      window.removeEventListener("user-login", handleUserLogin);
      window.removeEventListener("user-logout", handleUserLogout);
    };
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    let currentUser = user;
    if (!currentUser) {
      const userData = localStorage.getItem("user");
      if (userData) {
        currentUser = JSON.parse(userData);
        setUser(currentUser);
      }
    }

    if (!currentUser) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data);
      message.success("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể thêm vào giỏ hàng!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    let currentUser = user || JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;
    
    try {
      const response = await cartService.updateQuantity(itemId, quantity);
      setCart(response.data);
    } catch (error) {
      message.error("Lỗi khi cập nhật số lượng!");
    }
  };

  const removeFromCart = async (itemId) => {
    let currentUser = user || JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;
    
    try {
      const response = await cartService.removeItem(itemId);
      setCart(response.data);
      message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm!");
    }
  };

  const cartCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartCount,
        refreshCart: () => fetchCart(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
