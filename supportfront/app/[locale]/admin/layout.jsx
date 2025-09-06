"use client";

import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { truncateText } from "./utils/utils";
import { io } from "socket.io-client";

const LS_KEY = "admin_notifications_v1";
const MAX_ITEMS = 50;

// Basit bir item bileşeni: butonla sil + mobilde sağa kaydırınca sil
function NotificationItem({ n, onDelete }) {
  const startXRef = useRef(null);
  const deltaXRef = useRef(0);
  const rowRef = useRef(null);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (startXRef.current == null) return;
    const currentX = e.touches[0].clientX;
    deltaXRef.current = currentX - startXRef.current;
    // sola çekişi göster (negatif)
    if (rowRef.current) {
      const dx = Math.min(0, deltaXRef.current);
      rowRef.current.style.transform = `translateX(${dx}px)`;
      rowRef.current.style.transition = "none";
    }
  };

  const handleTouchEnd = () => {
    if (rowRef.current) {
      rowRef.current.style.transition = "transform 150ms ease";
      rowRef.current.style.transform = "translateX(0px)";
    }
    // yeterince sola kaydıysa sil
    if (deltaXRef.current < -60) onDelete();
    startXRef.current = null;
    deltaXRef.current = 0;
  };

  return (
    <div
      className="group relative border-b last:border-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sil butonu (hover’da görünür, mobile’da hep görünür) */}
      <button
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 md:opacity-0"
      >
        Sil
      </button>

      <div
        ref={rowRef}
        className="px-3 py-2 text-sm hover:bg-gray-50"
        title={n?.message}
      >
        {truncateText(n?.message ?? "", 90)}
        {n?.createdAt && (
          <div className="mt-1 text-[11px] text-gray-400">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const hideSidebar =
    pathname.includes("/admin/login") || pathname.includes("/admin/register");

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef(null);

  // localStorage’dan yükle
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotifications(Array.isArray(parsed.items) ? parsed.items : []);
        setUnread(Number(parsed.unread) || 0);
      }
    } catch {}
  }, []);

  // localStorage’a yaz
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ items: notifications, unread })
      );
    } catch {}
  }, [notifications, unread]);

  // Socket.io
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API}`);
    socketRef.current = socket;

    socket.on("receiveNotification", (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, MAX_ITEMS));
      setUnread((u) => u + 1);
    });

    return () => socket.disconnect();
  }, []);

  // Aç/kapat; açınca unread sıfırla (liste kalsın)
  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && unread > 0) setUnread(0);
  };

  // Tek bildirimi sil
  const deleteOne = (idx) => {
    setNotifications((prev) => prev.filter((_, i) => i !== idx));
  };

  // Hepsini okundu say ve gizle (listeyi temizle)
  const markAllReadAndHide = () => {
    setUnread(0);
    setNotifications([]);
  };

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}

      <div className="flex-1 bg-gray-100 relative">
        {!hideSidebar && (
          <div className="fixed top-4 right-6 z-50">
            <button
              onClick={toggleOpen}
              className="relative bg-white p-3 rounded-full shadow hover:bg-gray-100 transition"
            >
              <FaBell className="text-gray-600" size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="font-semibold">Bildirişlər</span>
                  <div className="flex items-center gap-2">
                    {/* Hepsini okundu say ve gizle */}
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllReadAndHide}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        title="Hepsini okundu say ve gizle"
                      >
                        Hepsini okundu
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n, index) => (
                      <NotificationItem
                        key={`${n?.id || n?._id || "n"}-${index}`}
                        n={n}
                        onDelete={() => deleteOne(index)}
                      />
                    ))
                  ) : (
                    <div className="px-3 py-5 text-sm text-gray-500 text-center">
                      Bildiriş yoxdur
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
