import { useEffect, useState, useContext } from "react";
import { Bell, Check, X } from "lucide-react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function NotificationBell() {
  const { auth } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/notifications");

      setNotifications(res.data);

      const unread = res.data.filter(
        (notification) => !notification.is_read
      ).length;

      setUnreadCount(unread);
    } catch (err) {
      console.error(
        "Error fetching notifications:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH UNREAD COUNT
  // ==========================================
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get(
        "/notifications/unread-count"
      );

      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(
        "Error fetching unread count:",
        err
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    if (!auth) return;

    fetchNotifications();

    // Check for new notifications every 10 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [auth]);

  // ==========================================
  // MARK ONE AS READ
  // ==========================================
  const markAsRead = async (notificationId) => {
    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      setUnreadCount((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    } catch (err) {
      console.error(
        "Error marking notification as read:",
        err
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================
  const markAllAsRead = async () => {
    try {
      await api.put(
        "/notifications/read-all"
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Error marking all notifications as read:",
        err
      );
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="relative">

      {/* ==============================
          NOTIFICATION BUTTON
      ============================== */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);

          if (!open) {
            fetchNotifications();
          }
        }}
        className="
          relative
          p-2
          rounded-xl
          text-white
          hover:bg-white/10
          transition
        "
        title="Notifications"
      >
        <Bell size={22} />

        {/* UNREAD BADGE */}
        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-[20px]
              h-5
              px-1
              rounded-full
              bg-red-500
              text-white
              text-[11px]
              font-bold
              flex
              items-center
              justify-center
              border-2
              border-slate-900
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* ==============================
          DROPDOWN
      ============================== */}
      {open && (
        <div
          className="
            absolute
            right-0
            mt-3
            w-[360px]
            max-w-[90vw]
            bg-slate-900
            border
            border-white/10
            rounded-2xl
            shadow-2xl
            overflow-hidden
            z-50
          "
        >

          {/* HEADER */}
          <div
            className="
              flex
              items-center
              justify-between
              px-4
              py-4
              border-b
              border-white/10
            "
          >
            <div>
              <h3 className="text-white font-bold text-lg">
                Notifications 🔔
              </h3>

              <p className="text-white/50 text-xs mt-1">
                {unreadCount} unread
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="
                text-white/50
                hover:text-white
                transition
              "
            >
              <X size={18} />
            </button>
          </div>

          {/* MARK ALL */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 border-b border-white/10">
              <button
                onClick={markAllAsRead}
                className="
                  text-cyan-400
                  hover:text-cyan-300
                  text-sm
                  font-medium
                  flex
                  items-center
                  gap-2
                "
              >
                <Check size={16} />
                Mark all as read
              </button>
            </div>
          )}

          {/* NOTIFICATION LIST */}
          <div className="max-h-[400px] overflow-y-auto">

            {loading ? (
              <div className="p-6 text-center">
                <p className="text-white/50">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">

                <div className="text-4xl mb-3">
                  🔕
                </div>

                <p className="text-white font-medium">
                  No notifications
                </p>

                <p className="text-white/40 text-sm mt-1">
                  You're all caught up!
                </p>

              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`
                      px-4
                      py-4
                      border-b
                      border-white/5
                      transition

                      ${
                        notification.is_read
                          ? "bg-transparent"
                          : "bg-cyan-500/10"
                      }

                      hover:bg-white/5
                    `}
                  >

                    <div className="flex gap-3">

                      {/* ICON */}
                      <div
                        className={`
                          w-9
                          h-9
                          rounded-full
                          flex
                          items-center
                          justify-center
                          shrink-0

                          ${
                            notification.is_read
                              ? "bg-white/10"
                              : "bg-cyan-500/20"
                          }
                        `}
                      >
                        🔔
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">

                        <p
                          className={`
                            text-sm
                            leading-relaxed

                            ${
                              notification.is_read
                                ? "text-white/60"
                                : "text-white"
                            }
                          `}
                        >
                          {notification.message}
                        </p>

                        <p className="text-white/30 text-xs mt-2">
                          {formatDate(
                            notification.created_at
                          )}
                        </p>

                        {/* MARK READ */}
                        {!notification.is_read && (
                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="
                              mt-2
                              text-xs
                              text-cyan-400
                              hover:text-cyan-300
                              font-medium
                            "
                          >
                            Mark as read
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}