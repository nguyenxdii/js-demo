import axiosInstance from "./api";

export const commentService = {
  getCommentsByProductId: async (productId) => {
    const response = await axiosInstance.get(`/comments/product/${productId}`);
    return response.data;
  },

  addComment: async (commentData) => {
    const response = await axiosInstance.post("/comments", commentData);
    return response.data;
  },

  checkEligibility: async (userId, productId) => {
    const response = await axiosInstance.get("/comments/check-eligibility", {
      params: { userId, productId }
    });
    return response.data;
  },

  getAllAdmin: async () => {
    const response = await axiosInstance.get("/comments/admin");
    return response.data;
  },
};
