import { Notification } from "../models/notification.model.js";


const createNotificationInDB = async ({
  userId,
  title,
  message,
  type = "system",
  metadata = null
}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      metadata
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  metadata = null
}) => {
  try {
    const notification = await createNotificationInDB({
      userId,
      title,
      message,
      type,
      metadata
    });

    return notification;
  } catch (error) {
    console.error("Error in createNotification:", error);
    return null;
  }
};


export const getUserNotifications = async (userId, limit = 20, skip = 0) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications,
      total,
      unread,
      hasMore: skip + limit < total
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], total: 0, unread: 0, hasMore: false };
  }
};


export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};


export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return null;
  }
};


export const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};


export const deleteOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });

    console.log(`Deleted ${result.deletedCount} old notifications`);
    return result;
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return null;
  }
};
