"use client";

import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { isSuppressed } from "@/lib/notificationSuppress";
import { protectedApi } from "@/lib/api";

interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationProps {
  socket: Socket | null;
}

export default function Notifications({ socket }: NotificationProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await protectedApi.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDelete = (data: { id: string }) => {
      if (isSuppressed("delete", data.id)) return;
      const notification: NotificationItem = {
        id: `tmp-delete-${Date.now()}`,
        user_id: "",
        type: "document:deleted",
        message: `Document deleted (ID: ${data.id.substring(0, 8)}...)`,
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
    };

    const handleUpdate = (data: { id: string }) => {
      if (isSuppressed("update", data.id)) return;
      const notification: NotificationItem = {
        id: `tmp-update-${Date.now()}`,
        user_id: "",
        type: "document:updated",
        message: `Document updated (ID: ${data.id.substring(0, 8)}...)`,
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
    };

    const handleNew = (data: NotificationItem) => {
      if (isSuppressed(data.type === "document:deleted" ? "delete" : "update", data.id)) return;
      setNotifications((prev) => [data, ...prev]);
    };

    socket.on("document:deleted", handleDelete);
    socket.on("document:updated", handleUpdate);
    socket.on("notification:new", handleNew);

    return () => {
      socket.off("document:deleted", handleDelete);
      socket.off("document:updated", handleUpdate);
      socket.off("notification:new", handleNew);
    };
  }, [socket]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await protectedApi.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="relative p-2 hover:bg-green-600 rounded-full transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-3 z-50 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Notifications</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">No notifications</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => n.id && !n.read && markRead(n.id)}
                className={`p-3 rounded-lg text-sm flex items-start gap-2 transition cursor-pointer ${
                  n.type === "document:deleted"
                    ? "bg-red-50 border-l-4 border-red-500"
                    : "bg-blue-50 border-l-4 border-blue-500"
                } ${n.read ? "opacity-60" : ""}`}
              >
                <span className="text-lg mt-0.5">{n.type === "document:deleted" ? "🗑️" : "✏️"}</span>
                <div className="flex-1">
                  <p className="text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

