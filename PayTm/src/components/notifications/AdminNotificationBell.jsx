import React, { useState, useRef, useEffect } from "react";
import { useAdminNotifications } from "../../admin/context/AdminNotificationContext";
import { Bell, X, CheckCheck } from "lucide-react";

const AdminNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const {
    notifications: contextNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useAdminNotifications();

  useEffect(() => {
    setNotifications(contextNotifications);
  }, [contextNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !bellRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    setNotifications((prev) =>
      prev.filter((n) => n._id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    const icons = {
      kyc: "🆔",
      withdrawal: "💰",
      deposit: "💳",
      transaction: "🔄",
      security: "🔒",
      user: "👤",
      fraud: "🚨",
      system: "📋"
    };
    return icons[type] || "📬";
  };

  const getNotificationColor = (type) => {
    const colors = {
      kyc: "bg-blue-50 border-l-4 border-blue-400",
      withdrawal: "bg-amber-50 border-l-4 border-amber-400",
      deposit: "bg-green-50 border-l-4 border-green-400",
      transaction: "bg-purple-50 border-l-4 border-purple-400",
      security: "bg-red-50 border-l-4 border-red-400",
      user: "bg-cyan-50 border-l-4 border-cyan-400",
      fraud: "bg-rose-50 border-l-4 border-rose-400",
      system: "bg-slate-50 border-l-4 border-slate-400"
    };
    return colors[type] || "bg-slate-50 border-l-4 border-slate-400";
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
        title="Admin Notifications"
        aria-label="Admin Notifications"
      >
        <Bell size={20} className="text-sky-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-slate-900 rounded-lg shadow-2xl z-50 max-h-96 flex flex-col border border-white/10"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-sky-600/20 to-cyan-600/20 p-4 border-b border-white/10 flex items-center justify-between rounded-t-lg">
            <div>
              <h3 className="font-bold text-white">Admin Notifications</h3>
              <p className="text-sm text-slate-400">
                {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Close"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={40} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg transition ${getNotificationColor(
                      notification.type
                    )} ${!notification.isRead ? "ring-1 ring-sky-400" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                          {notification.title || "Notification"}
                        </h4>
                        <p className="text-slate-700 text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-1 hover:bg-white/20 rounded transition"
                            title="Mark as read"
                          >
                            <CheckCheck size={16} className="text-sky-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-1 hover:bg-white/20 rounded transition"
                          title="Delete"
                        >
                          <X size={16} className="text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-white/10 p-3 bg-slate-800/50 rounded-b-lg flex gap-2">
              <button
                onClick={() => markAllAsRead()}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors text-sm font-medium"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
