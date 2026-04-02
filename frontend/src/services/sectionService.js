import api from "./api";

export const sectionService = {
  getAllSections: async () => {
    const response = await api.get("/sections");
    return response.data;
  },

  getActiveSections: async () => {
    const response = await api.get("/sections/active");
    return response.data;
  },

  createSection: async (data) => {
    const response = await api.post("/sections", data);
    return response.data;
  },

  updateSection: async (id, data) => {
    const response = await api.put(`/sections/${id}`, data);
    return response.data;
  },

  reorderSections: async (sectionIds) => {
    const response = await api.put("/sections/reorder", sectionIds);
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/sections/${id}`);
    return response.data;
  },

  addProductToSection: async (sectionId, productId) => {
    const response = await api.post(`/sections/${sectionId}/products/${productId}`);
    return response.data;
  },

  removeProductFromSection: async (sectionId, productId) => {
    const response = await api.delete(`/sections/${sectionId}/products/${productId}`);
    return response.data;
  },
};
