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
        // Redirect to home page
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );
};

export default api;