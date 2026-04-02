import axiosInstance from "./api";

export const productService = {
  // Lấy danh sách sản phẩm
  getAllProducts: async (params) => {
    const response = await axiosInstance.get("/products", { params });
    return response.data;
  },

  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // Lấy chi tiết sản phẩm theo Slug
  getProductBySlug: async (slug) => {
    const response = await axiosInstance.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Tạo mới sản phẩm
  createProduct: async (formData) => {
    const response = await axiosInstance.post("/products", formData);
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(`/products/${id}`, formData);
    return response.data;
  },

  // Soft delete (Ẩn sản phẩm - toggle active)
  softDeleteProduct: async (id) => {
    const formData = new FormData();
    formData.append('isActive', 'false');
    const response = await axiosInstance.put(`/products/${id}`, formData);
    return response.data;
  },

  // Hard delete (Xóa vĩnh viễn)
  hardDeleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}?hard=true`);
    return response.data;
  },
};
