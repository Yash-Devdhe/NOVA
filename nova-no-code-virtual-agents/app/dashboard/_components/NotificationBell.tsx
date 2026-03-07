"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { Bell, X, Check, Trash2, ExternalLink, Info, CheckCircle, AlertCircle, Image } from "lucide-react";

interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: number;
}

const NotificationBell = () => {
  const convex = useConvex();
  const { userDetail } = React.useContext(UserDetailContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logConvexError = (error: unknown, action: string) => {
    console.error(`[NotificationBell] ${action} failed`, error);
  };

  // Fetch notifications
  useEffect(() => {
    if (!userDetail?._id) return;
    let isCancelled = false;

    const fetchNotifications = async () => {
      try {
        const result = await convex.query(api.notifications.GetUserNotifications, {
          userId: userDetail._id as Id<"UserTable">,
        });
        if (!isCancelled) {
          setNotifications(result || []);
        }
      } catch (error) {
        if (!isCancelled) {
          setNotifications([]);
        }
        logConvexError(error, "fetch notifications");
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const count = await convex.query(api.notifications.GetUnreadCount, {
          userId: userDetail._id as Id<"UserTable">,
        });
        if (!isCancelled) {
          setUnreadCount(count || 0);
        }
      } catch (error) {
        if (!isCancelled) {
          setUnreadCount(0);
        }
        logConvexError(error, "fetch unread count");
      }
    };

    void Promise.all([fetchNotifications(), fetchUnreadCount()]);

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [userDetail, convex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await convex.mutation(api.notifications.MarkAsRead, {
        notificationId: notificationId as Id<"NotificationsTable">,
      });
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      logConvexError(error, "mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userDetail?._id) return;
    try {
      await convex.mutation(api.notifications.MarkAllAsRead, {
        userId: userDetail._id as Id<"UserTable">,
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      logConvexError(error, "mark all as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await convex.mutation(api.notifications.DeleteNotification, {
        notificationId: notificationId as Id<"NotificationsTable">,
      });
      const deleted = notifications.find(n => n._id === notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (deleted && !deleted.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      logConvexError(error, "delete notification");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "agent_created":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "media_generated":
        return <Image className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-300 hover:text-white"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? "text-gray-900" : "text-gray-600"
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3 text-gray-500" />
                            </button>
                          )}
                          {notification.link && (
                            <a
                              href={notification.link}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="View"
                            >
                              <ExternalLink className="h-3 w-3 text-gray-500" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
