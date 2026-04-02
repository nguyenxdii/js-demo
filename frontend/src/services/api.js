import axios from "axios";

// Cấu hình base URL cho API Backend
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Interceptor để tự động thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi 401 xảy ra và KHÔNG phải là request đăng nhập/đăng ký
    if (error.response?.status === 401 && !error.config.url.includes("/auth/")) {
      // Token hết hạn hoặc không hợp lệ -> Chuyển về login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth API endpoints
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};

// Product API endpoints
export const productAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
};

// Order API endpoints
export const orderAPI = {
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
};

// User API endpoints
export const userAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}/profile`, data),
  updateAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData),
};
