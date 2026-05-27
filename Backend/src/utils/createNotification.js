import { createNotification as createNotificationService } from "../services/notification.service.js";

/**
 * Legacy wrapper for backward compatibility
 * Now uses the enhanced notification service that includes email support
 */
export const createNotification = async (
  { userId, title, message, type, metadata = null, sendEmail = false, user = null },
  options = {}
) => {
  return createNotificationService({
    userId,
    title,
    message,
    type,
    metadata,
    sendEmail,
    user
  });
};