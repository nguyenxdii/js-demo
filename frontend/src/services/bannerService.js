import api from "./api";

export const bannerService = {
  getAllBanners: async () => {
    const response = await api.get("/banners");
    return response.data;
  },

  getActiveBanners: async () => {
    const response = await api.get("/banners/active");
    return response.data;
  },

  createBanner: async (formData) => {
    const response = await api.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateBanner: async (id, formData) => {
    const response = await api.put(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};
