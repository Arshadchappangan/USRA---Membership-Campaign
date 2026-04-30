import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const API_BASE = import.meta.env.VITE_API_URL || "https://usra-membership-campaign.onrender.com/api";

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

export const getMemberById = (id) => api.get(`/members/${id}`);

// Pagination
export const getMembers = (page = 1, limit = 20) =>
  api.get("/members", { params: { page, limit } });

// Update member
export const updateMember = (id, draft) => {
  const payload = {};

  // ── Personal ────────────────────────────────────────────────────────────────
  if (draft.dob !== undefined) payload.dob = draft.dob;
  if (draft.gender !== undefined) payload.gender = draft.gender;
  if (draft.bloodGroup !== undefined) payload.bloodGroup = draft.bloodGroup;
  if (draft.father !== undefined) payload.father = draft.father;
  if (draft.mother !== undefined) payload.mother = draft.mother;
  if (draft.maritalStatus !== undefined) payload.maritalStatus = draft.maritalStatus;
  if (draft.children !== undefined) payload.children = draft.children;
  if (draft.bio !== undefined) payload.bio = draft.bio;

  // spouse: draft uses "spouseName", schema field is "spouse"
  if (draft.spouseName !== undefined) payload.spouse = draft.spouseName;
  if (draft.spousePhone !== undefined) payload.spousePhone = draft.spousePhone;
  if (draft.spouseJob !== undefined) payload.spouseJob = draft.spouseJob;

  // ── Contact ─────────────────────────────────────────────────────────────────
  if (draft.phone !== undefined) payload.phone = draft.phone;
  if (draft.email !== undefined) payload.email = draft.email;
  if (draft.place !== undefined) payload.place = draft.place;
  if (draft.houseName !== undefined) payload.houseName = draft.houseName;

  // ── Career ──────────────────────────────────────────────────────────────────
  if (draft.employmentType !== undefined) payload.employmentType = draft.employmentType;
  if (draft.sector !== undefined) payload.sector = draft.sector;
  if (draft.organisation !== undefined) payload.organisation = draft.organisation;
  if (draft.jobTitle !== undefined) payload.jobTitle = draft.jobTitle;
  if (draft.jobLocation !== undefined) payload.jobLocation = draft.jobLocation;
  if (draft.skills !== undefined) payload.skills = draft.skills;

  // annualIncome: convert to Number, or null if blank
  if (draft.annualIncome !== undefined) {
    const n = Number(draft.annualIncome);
    payload.annualIncome = (draft.annualIncome === "" || isNaN(n)) ? null : n;
  }

  // ── Education ───────────────────────────────────────────────────────────────
  if (draft.highestQualification !== undefined)
    payload.highestQualification = draft.highestQualification;
  // Always send arrays so removals (empty array) are persisted
  payload.educations = draft.educations ?? [];
  payload.experiences = draft.experiences ?? [];

  return api.patch(`/members/${id}`, payload);
};


// ─── Payment API ─────────────────────────────

export const paymentAPI = {
  createOrder: (memberId) =>
    api.post("/payment/create-order", { memberId }),

  verify: (data) => api.post("/payment/verify", data),

  markFailed: (memberId) =>
    api.post("/payment/failed", { memberId }),
};

export default api;