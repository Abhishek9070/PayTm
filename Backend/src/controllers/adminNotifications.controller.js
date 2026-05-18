import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiErros.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "../utils/createNotification.js";
import { AdminAudit } from "../models/adminAudit.model.js";

export const sendAdminNotification = asyncHandler(async (req, res) => {
  const { type, title, message, targetUserId, broadcast } = req.body;

  if (!type || !["push", "email", "sms", "announcement"].includes(type)) {
    throw new ApiError(400, "Invalid notification type");
  }

  if (!title || !message) {
    throw new ApiError(400, "title and message are required");
  }

  if (!broadcast && !targetUserId) {
    throw new ApiError(400, "Provide targetUserId or set broadcast=true");
  }

  // If broadcast, create notifications for all users (simple implementation: create one announcement entry)
  if (broadcast) {
    await createNotification({ userId: null, title, message, type: "announcement", metadata: { broadcast: true } });
    await AdminAudit.create({ adminId: req.user._id, action: `send_${type}_broadcast`, targetUser: null, metadata: { title, message } });
    return res.status(200).json(new ApiResponse(200, null, "Broadcast notification queued"));
  }

  // send to a single user
  await createNotification({ userId: targetUserId, title, message, type });
  await AdminAudit.create({ adminId: req.user._id, action: `send_${type}`, targetUser: targetUserId, metadata: { title, message } });

  return res.status(200).json(new ApiResponse(200, null, "Notification sent"));
});
