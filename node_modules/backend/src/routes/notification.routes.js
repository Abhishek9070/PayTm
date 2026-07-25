import { Router } from "express";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all notifications
router.get(
  "/",
  verifyJWT,
  getMyNotifications
);

// Get unread count
router.get(
  "/unread/count",
  verifyJWT,
  getUnreadNotificationCount
);

// Mark single notification as read
router.patch(
  "/:notificationId/read",
  verifyJWT,
  markNotificationAsRead
);

// Mark all notifications as read
router.patch(
  "/read-all",
  verifyJWT,
  markAllAsRead
);

// Delete single notification
router.delete(
  "/:notificationId",
  verifyJWT,
  deleteNotification
);

// Delete all notifications
router.delete(
  "/",
  verifyJWT,
  deleteAllNotifications
);

export default router;