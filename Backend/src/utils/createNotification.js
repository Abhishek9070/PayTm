import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  metadata = null
}, options = {}) => {
  const [notification] = await Notification.create([
    {
      userId,
      title,
      message,
      type,
      metadata
    }
  ], options);

  return notification;
};