"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Briefcase, Megaphone, Info, Building } from "lucide-react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: "TASK" | "ANNOUNCEMENT" | "REQUEST" | "SYSTEM";
  isRead: boolean;
  link?: string;
  createdAt: string;
};

function getNotificationIcon(type?: string) {
  switch (type) {
    case "TASK":
      return <Briefcase className="h-5 w-5 text-gray-700" />;
    case "ANNOUNCEMENT":
      return <Megaphone className="h-5 w-5 text-gray-700" />;
    case "REQUEST":
      return <Building className="h-5 w-5 text-gray-700" />;
    default:
      return <Info className="h-5 w-5 text-gray-700" />;
  }
}

export default function NotificationMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // State for Auto Popup
  const [popup, setPopup] = useState<NotificationItem | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchUnreadCount();

    // Polling setiap 30 detik untuk update badge secara real-time
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unreadCount || 0;

        // Show popup if it's not the initial load and the count has increased
        if (!isFirstLoad.current && newCount > unreadCount) {
          fetchLatestForPopup();
        }

        if (isFirstLoad.current) {
          isFirstLoad.current = false;
        }

        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }

  async function fetchLatestForPopup() {
    try {
      const res = await fetch("/api/notifications?limit=1");
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setPopup(data.items[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch latest for popup", err);
    }
  }

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleMenu() {
    const newState = !open;
    setOpen(newState);
    if (newState) {
      fetchNotifications();
    }
  }

  async function markAsRead(id: string, link?: string) {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });

      if (link) {
        setOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }

  async function markAllAsRead() {
    try {
      // Optimistic upate
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}mnt yg lalu`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}jam yg lalu`;
    return `${Math.floor(diffInSeconds / 86400)}hr yg lalu`;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className="relative grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modal Notification List (Centered) */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-[85%] max-w-md rounded-2xl bg-[#F0F0F0] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            ref={menuRef}
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold tracking-wide text-black">
                PESAN
              </h3>
            </div>

            {/* Content Body */}
            <div className="max-h-64 overflow-y-auto mb-6 pr-2">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="w-6 h-6 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Belum ada pesan
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors ${
                        !n.isRead
                          ? "bg-white shadow-sm"
                          : "bg-gray-200/50 hover:bg-gray-200"
                      }`}
                      onClick={() => {
                        markAsRead(n.id, n.link);
                        // If there are links, it will navigate and we can close, but let's just keep the behavior
                      }}
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-[#C4C4C4]">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${!n.isRead ? "font-bold text-black" : "font-medium text-gray-700"} line-clamp-2`}
                        >
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px] text-gray-500">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {unreadCount > 0 && notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                >
                  Tandai semua dibaca
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded bg-[#B3B3B3] py-3 text-sm font-extrabold uppercase tracking-widest text-black transition-colors hover:bg-[#a3a3a3]"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Popup (Centered Auto-Trigger) */}
      {popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[85%] max-w-md rounded-2xl bg-[#F0F0F0] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold tracking-wide text-black">
                PESAN
              </h3>
            </div>

            {/* Content Body */}
            <div
              className="mb-8 flex cursor-pointer items-center gap-4 py-4 px-2"
              onClick={() => {
                markAsRead(popup.id, popup.link);
                setPopup(null);
              }}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-[#C4C4C4]">
                {getNotificationIcon(popup.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black">
                  {popup.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => setPopup(null)}
              className="w-full rounded bg-[#B3B3B3] py-3 text-sm font-bold tracking-wider text-black transition-colors hover:bg-[#a3a3a3]"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
