import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllAsRead, deleteNotification as deleteNotificationApi } from "../services/notificationApi";


const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

 
  const fetchNotifications = useCallback(async (limit = 20, skip = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getNotifications(limit, skip);
      setNotifications(response.notifications);
      setUnreadCount(response.unread);
      return response;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error("Error fetching unread count:", err);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
    
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
   
      await fetchUnreadCount();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, [fetchUnreadCount]);


  const markAllAsReadHandler = useCallback(async () => {
    try {
      await markAllAsRead();
    
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

 
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotificationApi(notificationId);
      
      
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      await fetchUnreadCount();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }, [fetchUnreadCount]);


  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);


  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

 
    const notificationInterval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 3000);


    return () => clearInterval(notificationInterval);
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
    deleteNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
