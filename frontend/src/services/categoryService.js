import axiosInstance from "./api";

export const categoryService = {
  // Lấy danh sách cây danh mục (Category Tree)
  getCategoryTree: async () => {
    const response = await axiosInstance.get("/categories/tree");
    return response.data;
  },

  // Lấy tất cả danh mục (dành cho Admin)
  getAllCategories: async () => {
    const response = await axiosInstance.get("/categories?all=true");
    return response.data;
  },

  // Lấy danh mục đang active (dành cho Khách)
  getActiveCategories: async () => {
    const response = await axiosInstance.get("/categories");
    return response.data;
  },

  // Lấy chi tiết danh mục theo ID
  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  // Thêm danh mục mới (hỗ trợ file upload và parentId)
  createCategory: async (formData) => {
    const response = await axiosInstance.post("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cập nhật danh mục
  updateCategory: async (id, formData) => {
    const response = await axiosInstance.put(`/categories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cập nhật trạng thái hiển thị/ẩn mướt (Soft delete)
  toggleCategoryStatus: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },

  // Xóa vĩnh viễn danh mục (Hard delete)
  deleteCategoryPermanent: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}?hard=true`);
    return response.data;
  },
};
