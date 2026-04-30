import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  metadata = null
}, options = {}) => {
  return Notification.create({
    userId,
    title,
    message,
    type,
    metadata
  }, options);
};