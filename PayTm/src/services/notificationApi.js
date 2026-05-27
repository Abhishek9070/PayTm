import api from "../api/axios";


export const getNotifications = async (limit = 20, skip = 0) => {
  try {
    const response = await api.get("/notifications", {
      params: { limit, skip }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};


export const getUnreadCount = async () => {
  try {
    const response = await api.get(
      "/notifications/unread/count"
    );
    return response.data.data.unread;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};


export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};


export const markAllAsRead = async () => {
  try {
    const response = await api.patch(
      "/notifications/read-all"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};


export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(
      `/notifications/${notificationId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};


export const deleteAllNotifications = async () => {
  try {
    const response = await api.delete("/notifications");
    return response.data.data;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};


export const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN");
};

export const getNotificationIcon = (type) => {
  const icons = {
    credit: "💚", // Money received
    debit: "💛", // Money sent
    withdrawal: "🏦", // Withdrawal
    deposit: "💰", // Deposit
    kyc: "✅", // KYC status
    security: "🔒", // Security alerts
    system: "ℹ️" // System notifications
  };
  return icons[type] || "📢";
};


export const getNotificationColor = (type) => {
  const colors = {
    credit: "bg-emerald-900/30 border-emerald-700/50",
    debit: "bg-amber-900/30 border-amber-700/50",
    withdrawal: "bg-blue-900/30 border-blue-700/50",
    deposit: "bg-purple-900/30 border-purple-700/50",
    kyc: "bg-indigo-900/30 border-indigo-700/50",
    security: "bg-red-900/30 border-red-700/50",
    system: "bg-slate-800/50 border-slate-700/50"
  };
  return colors[type] || "bg-slate-800/50 border-slate-700/50";
};


export const getNotificationTextColor = (type) => {
  const colors = {
    credit: "text-emerald-400",
    debit: "text-amber-400",
    withdrawal: "text-blue-400",
    deposit: "text-purple-400",
    kyc: "text-indigo-400",
    security: "text-red-400",
    system: "text-slate-300"
  };
  return colors[type] || "text-slate-300";
};
