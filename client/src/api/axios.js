import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // Important: send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for auth-check requests (handled by AuthContext)
      const isAuthCheck = error.config?.url?.includes("/api/auth/me");
      if (!isAuthCheck) {
        // Token expired or invalid mid-session - redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
