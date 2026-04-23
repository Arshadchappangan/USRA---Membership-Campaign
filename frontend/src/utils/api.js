import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Members API
export const membersAPI = {
  // Single call that saves member + photo together — called only from ConfirmPage
  createWithPhoto: (formData) =>
    api.post('/members', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getById: (id) => api.get(`/members/${id}`),
};

// Payment API
export const paymentAPI = {
  createOrder: (memberId) => api.post('/payment/create-order', { memberId }),
  verify: (data) => api.post('/payment/verify', data),
  markFailed: (memberId) => api.post('/payment/failed', { memberId }),
};

// members list with pagination
export const getMembers = (page = 1, limit = 20) =>
  api.get(`/members?page=${page}&limit=${limit}`);

export default api;
