import api from "./api";

export const cartService = {
  getCart: (userId) => api.get(`/cart`), // Backend lấy từ token
  
  addToCart: (productId, quantity) => 
    api.post("/cart", { productId, quantity }),
    
  updateQuantity: (itemId, quantity) => 
    api.put(`/cart/item/${itemId}?quantity=${quantity}`),
    
  removeItem: (itemId) => 
    api.delete(`/cart/item/${itemId}`),
};
