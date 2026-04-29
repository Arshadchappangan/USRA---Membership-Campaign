import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("usra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);


// ─── Auth API ─────────────────────────────────

export const loginMember = (memberId, dob) =>
  api.post("/auth/login", { memberId, dob });


// ─── Members API ─────────────────────────────

export const membersAPI = {
  createWithPhoto: (formData) =>
    api.post("/members", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getById: (id) => api.get(`/members/${id}`),
};

// Pagination
export const getMembers = (page = 1, limit = 20) =>
  api.get("/members", { params: { page, limit } });

// Update member
export const updateMember = (id, data) =>
  api.patch(`/members/${id}`, data);


// ─── Payment API ─────────────────────────────

export const paymentAPI = {
  createOrder: (memberId) =>
    api.post("/payment/create-order", { memberId }),

  verify: (data) => api.post("/payment/verify", data),

  markFailed: (memberId) =>
    api.post("/payment/failed", { memberId }),
};

export default api;