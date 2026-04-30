import { Router } from "express";

import {
  getMyNotifications,
  markNotificationAsRead
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  verifyJWT,
  getMyNotifications
);

router.patch(
  "/:notificationId/read",
  verifyJWT,
  markNotificationAsRead
);

export default router;