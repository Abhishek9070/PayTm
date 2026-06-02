import { Notification } from "../models/notification.model.js";
import {
  sendMoneyReceivedEmail,
  sendMoneyDebitedEmail,
  sendWithdrawalRequestEmail,
  sendWithdrawalSuccessEmail,
  sendKYCApprovedEmail,
  sendKYCRejectedEmail,
  sendLoginAlertEmail,
  sendPasswordChangedEmail,
  sendLowBalanceAlertEmail
} from "./email.service.js";


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
  sendEmail = false,
  metadata = null,
  user = null
}) => {
  try {
  
    const notification = await createNotificationInDB({
      userId,
      title,
      message,
      type,
      metadata
    });

  
    if (sendEmail && user && user.email) {
   
      await sendEmailNotification({
        user,
        type,
        metadata,
        title,
        message
      });
    }

  

    return notification;
  } catch (error) {
    console.error("Error in createNotification:", error);
    return null;
  }
};


const sendEmailNotification = async ({ user, type, metadata, title, message }) => {
  const { email, firstName, lastName } = user;
  const userName = `${firstName} ${lastName}`;
  const now = new Date().toLocaleString("en-IN");

  try {
    switch (type) {
      case "credit":
        await sendMoneyReceivedEmail({
          email,
          amount: metadata?.amount || 0,
          senderName: metadata?.senderName || "Unknown",
          availableBalance: metadata?.availableBalance || 0,
          transactionId: metadata?.transactionId || "N/A",
          time: metadata?.time || now
        });
        break;

      case "debit":
        await sendMoneyDebitedEmail({
          email,
          amount: metadata?.amount || 0,
          recipientName: metadata?.recipientName || "Unknown",
          availableBalance: metadata?.availableBalance || 0,
          transactionId: metadata?.transactionId || "N/A",
          time: metadata?.time || now
        });
        break;

      case "withdrawal":
        if (metadata?.status === "requested") {
          await sendWithdrawalRequestEmail({
            email,
            amount: metadata?.amount || 0,
            withdrawalId: metadata?.withdrawalId || "N/A",
            time: metadata?.time || now
          });
        } else if (metadata?.status === "completed") {
          await sendWithdrawalSuccessEmail({
            email,
            amount: metadata?.amount || 0,
            accountNumber: metadata?.accountNumber || "",
            time: metadata?.time || now,
            transactionId: metadata?.transactionId || "N/A"
          });
        }
        break;

      case "kyc":
        if (metadata?.status === "approved") {
          await sendKYCApprovedEmail({
            email,
            userName
          });
        } else if (metadata?.status === "rejected") {
          await sendKYCRejectedEmail({
            email,
            userName,
            reason: metadata?.reason || "Documents do not meet requirements"
          });
        }
        break;

      case "security":
        if (metadata?.type === "login_alert") {
          await sendLoginAlertEmail({
            email,
            userName,
            ip: metadata?.ip || "Unknown",
            browser: metadata?.browser || "Unknown",
            time: metadata?.time || now,
            deviceName: metadata?.deviceName || "Unknown Device"
          });
        } else if (metadata?.type === "password_changed") {
          await sendPasswordChangedEmail({
            email,
            userName,
            time: metadata?.time || now
          });
        }
        break;

      case "low_balance":
        await sendLowBalanceAlertEmail({
          email,
          userName,
          balance: metadata?.balance || 0
        });
        break;

      default:
        console.log("No email template for type:", type);
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
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
