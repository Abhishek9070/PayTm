import { Notification } from "../models/notification.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getUserNotifications,
  markNotificationAsRead as markAsReadService,
  markAllNotificationsAsRead,
  getUnreadCount
} from "../services/notification.service.js";
import ApiError from "../utils/apiErros.js";


export const getMyNotifications = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  const result = await getUserNotifications(req.user._id, limit, skip);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications: result.notifications,
        total: result.total,
        unread: result.unread,
        hasMore: result.hasMore
      },
      "Notifications fetched successfully"
    )
  );
});


export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { unread: count },
      "Unread count fetched successfully"
    )
  );
});


export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }

  const notification = await markAsReadService(notificationId, req.user._id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read"
    )
  );
});


export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsRead(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "All notifications marked as read"
    )
  );
});


export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification deleted successfully"
    )
  );
});


export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    userId: req.user._id
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "All notifications deleted successfully"
    )
  );
});