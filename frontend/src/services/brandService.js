import axiosInstance from "./api";

export const brandService = {
  // Lấy tất cả thương hiệu (Admin)
  getAllBrands: async (all = true) => {
    const response = await axiosInstance.get(`/brands?all=${all}`);
    return response.data;
  },

  // Lấy danh sách đang hoạt động (Active)
  getActiveBrands: async () => {
    const response = await axiosInstance.get("/brands");
    return response.data;
  },

  // Lấy chi tiết thương hiệu
  getBrandById: async (id) => {
    const response = await axiosInstance.get(`/brands/${id}`);
    return response.data;
  },

  // Thêm mới thương hiệu
  createBrand: async (formData) => {
    const response = await axiosInstance.post("/brands", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cập nhật thương hiệu
  updateBrand: async (id, formData) => {
    const response = await axiosInstance.put(`/brands/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Soft delete thương hiệu
  toggleBrandStatus: async (id) => {
    const response = await axiosInstance.delete(`/brands/${id}`);
    return response.data;
  },

  // Hard delete thương hiệu
  deleteBrandPermanent: async (id) => {
    const response = await axiosInstance.delete(`/brands/${id}?hard=true`);
    return response.data;
  },
};
