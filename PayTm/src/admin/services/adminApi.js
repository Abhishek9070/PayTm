import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:8000/api/v1/admin",
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const DEBUG = true;
const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[AdminAPI] ${message}`, data || "");
  }
};

const processQueue = (error, token = null) => {
  log(`Processing queue with ${failedQueue.length} pending requests`, { error: !!error, token: !!token });
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

// Add request interceptor to ensure token is always included
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("paytm_admin_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      log(`Setting auth header for ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    log("Request interceptor error", error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for token expiration handling with refresh
adminApi.interceptors.response.use(
  (response) => {
    log(`Response from ${response.config.method?.toUpperCase()} ${response.config.url}`, { status: response.status });
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url;

    log(`Error response from ${originalRequest?.method?.toUpperCase()} ${url}`, { 
      status, 
      retried: originalRequest?._retried,
      message: error.response?.data?.message || error.message 
    });

    // Prevent infinite loops by checking if request was already retried
    if (originalRequest?._retried) {
      log("Request already retried once, rejecting to prevent infinite loop", { url });
      return Promise.reject(error);
    }

    if (status === 403 || status === 401) {
      log(`Auth error (${status}), attempting token refresh`, { url });
      
      // Mark this request as retried to prevent infinite loops
      originalRequest._retried = true;

      if (!isRefreshing) {
        isRefreshing = true;
        log("Starting token refresh");

        const refreshToken = localStorage.getItem("paytm_admin_refresh_token");
        if (!refreshToken) {
          log("No refresh token found, logging out");
          // No refresh token, redirect to login
          processQueue(error, null);
          localStorage.removeItem("paytm_admin_token");
          localStorage.removeItem("paytm_admin");
          localStorage.removeItem("paytm_admin_refresh_token");
          delete adminApi.defaults.headers.common.Authorization;
          window.location.href = "/admin/login";
          return Promise.reject(error);
        }

        // Use a direct axios instance without interceptors for refresh to avoid infinite loops
        return axios
          .post("http://localhost:8000/api/v1/admin/auth/refresh-token", { refreshToken }, {
            withCredentials: true
          })
          .then((res) => {
            log("Token refresh successful", { hasData: !!res.data.data });
            
            const newAccessToken = res.data.data?.accessToken;
            const newRefreshToken = res.data.data?.refreshToken;

            if (!newAccessToken) {
              log("ERROR: No access token in refresh response");
              throw new Error("No access token in refresh response");
            }

            log("Storing new tokens");
            localStorage.setItem("paytm_admin_token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("paytm_admin_refresh_token", newRefreshToken);
            }
            adminApi.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            log(`Retrying original request: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
            
            // Retry with fresh interceptor state
            return adminApi(originalRequest);
          })
          .catch((err) => {
            log("Token refresh failed", { message: err.response?.data?.message || err.message });
            processQueue(err, null);
            localStorage.removeItem("paytm_admin_token");
            localStorage.removeItem("paytm_admin");
            localStorage.removeItem("paytm_admin_refresh_token");
            delete adminApi.defaults.headers.common.Authorization;
            window.location.href = "/admin/login";
            return Promise.reject(err);
          });
      } else {
        log("Token refresh already in progress, queuing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            log(`Retrying queued request with new token: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return adminApi(originalRequest);
          })
          .catch((err) => {
            log("Queued request failed", { message: err.message });
            return Promise.reject(err);
          });
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
