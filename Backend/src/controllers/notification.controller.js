import { Notification } from "../models/notification.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {

  const notifications = await Notification.find({
    userId: req.user._id
  })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      notifications,
      "Notifications fetched successfully"
    )
  );
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {

  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId: req.user._id
    },
    {
      isRead: true
    },
    {
      new: true
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read"
    )
  );
});