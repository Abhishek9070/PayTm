import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true
});

// Setup interceptors for token expiration
export const setupInterceptors = (logoutCallback) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        logoutCallback();
        // Optionally redirect to login with a message
        const searchParams = new URLSearchParams();
        searchParams.set("message", "Session expired. Please login again.");
        window.location.href = `/login?${searchParams.toString()}`;
      }
      return Promise.reject(error);
    }
  );
};

export default api;