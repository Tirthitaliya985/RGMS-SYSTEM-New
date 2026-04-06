import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API calls
export const userAPI = {
  register: (data) => apiClient.post("/users/register", data),
  login: (data) => apiClient.post("/users/login", data),

  getProfile: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (id, data) => apiClient.put(`/users/${id}`, data),

  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  getAllUsers: () => apiClient.get("/users"),
  
};

// Visitor API calls
export const visitorAPI = {
  getAllVisitors: () => apiClient.get("/v-visitors"),
  getVisitor: (id) => apiClient.get(`/v-visitors/${id}`),
  createVisitor: (data) => apiClient.post("/v-visitors", data),
  updateVisitor: (id, data) => apiClient.put(`/v-visitors/${id}`, data),
  deleteVisitor: (id) => apiClient.delete(`/v-visitors/${id}`),
  getVisitorsByStatus: (status) => apiClient.get(`/v-visitors/status/${status}`),
  getVisitorsByDateRange: (startDate, endDate) =>
    apiClient.get(`/v-visitors/date-range`, {
      params: { startDate, endDate },
    }),
};

export default apiClient;
