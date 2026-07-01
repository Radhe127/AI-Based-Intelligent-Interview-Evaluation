import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const fetchMe = () => api.get("/auth/me");

// Resume
export const uploadResume = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const fetchLatestResume = () => api.get("/resume/latest");

// Interviews
export const startInterview = (data) => api.post("/interviews/start", data);
export const getNextQuestion = (interviewId) =>
  api.post(`/interviews/${interviewId}/next-question`);
export const submitAnswer = (interviewId, payload) =>
  api.post(`/interviews/${interviewId}/answer`, payload);
export const finishInterview = (interviewId) =>
  api.post(`/interviews/${interviewId}/finish`);
export const getReport = (interviewId) => api.get(`/interviews/${interviewId}/report`);
export const listInterviews = () => api.get("/interviews");

// User
export const updateProfile = (data) => api.put("/users/profile", data);

export default api;
