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

  if (broadcast) {
    await createNotification({ userId: null, title, message, type: "announcement", metadata: { broadcast: true } });
    try {
      if (typeof AdminAudit !== "undefined" && AdminAudit && AdminAudit.create) {
        await AdminAudit.create({ adminId: req.user._id, action: `send_${type}_broadcast`, targetUser: null, metadata: { title, message } });
      } else {
        console.warn("AdminAudit model not available - skipping audit for send_${type}_broadcast");
      }
    } catch (e) {
      console.warn("AdminAudit.create failed:", e && e.message ? e.message : e);
    }
    return res.status(200).json(new ApiResponse(200, null, "Broadcast notification queued"));
  }
  await createNotification({ userId: targetUserId, title, message, type });
  try {
    if (typeof AdminAudit !== "undefined" && AdminAudit && AdminAudit.create) {
      await AdminAudit.create({ adminId: req.user._id, action: `send_${type}`, targetUser: targetUserId, metadata: { title, message } });
    } else {
      console.warn("AdminAudit model not available - skipping audit for send_${type}");
    }
  } catch (e) {
    console.warn("AdminAudit.create failed:", e && e.message ? e.message : e);
  }

  return res.status(200).json(new ApiResponse(200, null, "Notification sent"));
});
