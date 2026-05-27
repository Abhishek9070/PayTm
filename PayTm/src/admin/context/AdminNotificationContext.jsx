import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import axios from "axios";

const AdminNotificationContext = createContext();

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationProvider"
    );
  }
  return context;
};

// Create a dedicated API instance for admin notifications using the regular API endpoint
const adminNotificationApi = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true
});

// Add request interceptor to include auth token
adminNotificationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("paytm_admin_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (limit = 20, skip = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminNotificationApi.get("/notifications", {
        params: { limit, skip }
      });
      const data = response.data?.data || response.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || data.unread || 0);
      return data;
    } catch (err) {
      console.error("Error fetching admin notifications:", err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await adminNotificationApi.get("/notifications/unread/count");
      const count = response.data?.data?.unreadCount || response.data?.data || 0;
      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error("Error fetching admin unread count:", err);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await adminNotificationApi.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      await fetchUnreadCount();
    } catch (err) {
      console.error("Error marking admin notification as read:", err);
    }
  }, [fetchUnreadCount]);

  const markAllAsReadHandler = useCallback(async () => {
    try {
      await adminNotificationApi.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all admin notifications as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await adminNotificationApi.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      await fetchUnreadCount();
    } catch (err) {
      console.error("Error deleting admin notification:", err);
    }
  }, [fetchUnreadCount]);

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for unread count every 30 seconds
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead: markAllAsReadHandler,
    deleteNotification
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};
