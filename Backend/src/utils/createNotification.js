import { createNotification as createNotificationService } from "../services/notification.service.js";

export const createNotification = async ({ userId, title, message, type, metadata = null }) => {
  return createNotificationService({
    userId,
    title,
    message,
    type,
    metadata
  });
};