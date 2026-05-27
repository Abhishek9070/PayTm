import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  getNotificationTextColor
} from "../../services/notificationApi";
import { Trash2, Check } from "lucide-react";

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
  };

  const handleDelete = () => {
    onDelete(notification._id);
  };

  return (
    <div
      className={`border-l-4 p-4 mb-2 rounded-r-md ${getNotificationColor(
        notification.type
      )} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <span className="text-2xl mt-1 shrink-0">
            {getNotificationIcon(notification.type)}
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={`font-semibold text-sm ${getNotificationTextColor(
                  notification.type
                )}`}
              >
                {notification.title}
              </h4>
              {!notification.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatNotificationTime(notification.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Mark as read"
            >
              <Check size={16} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metadata (if available) */}
      {notification.metadata && (
        <div className="mt-2 ml-10 text-xs text-gray-500">
          {notification.metadata.amount && (
            <p>Amount: ₹{notification.metadata.amount}</p>
          )}
          {notification.metadata.transactionId && (
            <p>ID: {notification.metadata.transactionId}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
