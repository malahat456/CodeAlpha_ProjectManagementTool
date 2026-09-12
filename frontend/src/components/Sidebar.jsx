import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  LogOut,
  Bell,
  Check,
  X,
} from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Sidebar({ currentPage, setCurrentPage, role }) {
  const { auth, setAuth } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {
    setAuth(null);
    setCurrentPage("dashboard");

    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("currentPage");

    alert("Logged out successfully!");
  };

  // ==========================================
  // MENU ITEMS
  // ==========================================
  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      id: "projects",
      icon: Folder,
      label: "Projects",
    },
    {
      id: "tasks",
      icon: CheckSquare,
      label: "Tasks",
    },
    {
      id: "kanban",
      icon: LayoutDashboard,
      label: "Kanban Board",
      adminOnly: false,
    },
  ];

  // ==========================================
  // NAVIGATION
  // ==========================================
  const handleClick = (id) => {
    setCurrentPage(id);
  };

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const res = await api.get("/notifications");

      setNotifications(res.data);

      const unread = res.data.filter(
        (notification) => !Boolean(notification.is_read),
      ).length;

      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationLoading(false);
    }
  };

  // ==========================================
  // FETCH ONLY UNREAD COUNT
  // ==========================================
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");

      setUnreadCount(Number(res.data.unreadCount) || 0);
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  };

  // ==========================================
  // SOCKET.IO REAL-TIME NOTIFICATIONS
  // ==========================================
  useEffect(() => {
    if (!auth) return;

    // Get JWT token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No authentication token found for Socket.IO");
      return;
    }

    console.log("Connecting to Socket.IO...");

    const socket = io("http://localhost:5000", {
      auth: {
        token: token,
      },
      transports: ["websocket"],
    });

    // ==========================================
    // SOCKET CONNECTED
    // ==========================================
    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
    });

    // ==========================================
    // SOCKET CONNECTION ERROR
    // ==========================================
    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });

    // ==========================================
    // NEW REAL-TIME NOTIFICATION
    // ==========================================
    socket.on("notification", (newNotification) => {
      console.log(
        "New real-time notification received:",
        newNotification,
      );

      setNotifications((prev) => {
        // Prevent duplicate notifications
        const alreadyExists = prev.some(
          (notification) =>
            Number(notification.id) === Number(newNotification.id),
        );

        if (alreadyExists) {
          return prev;
        }

        return [newNotification, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
    });

    // ==========================================
    // CLEANUP
    // ==========================================
    return () => {
      socket.disconnect();
      console.log("Socket.IO disconnected");
    };
  }, [auth]);

  // ==========================================
  // INITIAL NOTIFICATION LOAD
  // ==========================================
  useEffect(() => {
    if (!auth) return;

    fetchNotifications();

    // Backup check every 10 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [auth]);

  // ==========================================
  // OPEN / CLOSE NOTIFICATIONS
  // ==========================================
  const toggleNotifications = () => {
    const newState = !showNotifications;

    setShowNotifications(newState);

    if (newState) {
      fetchNotifications();
    }
  };

  // ==========================================
  // MARK ONE AS READ
  // ==========================================
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          Number(notification.id) === Number(notificationId)
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      );

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="w-72 min-h-screen backdrop-blur-2xl bg-white/5 border-r border-white/10 flex flex-col">
      {/* ======================================
          LOGO
      ====================================== */}
      <div className="p-8 border-b border-white/10">
        <h1 className="text-4xl font-extrabold text-center text-white drop-shadow-2xl">
          Project<span className="text-pink-400">MS</span>
        </h1>

        <p className="text-center text-white/70 mt-2 text-sm">
          Smart Management System
        </p>
      </div>

      {/* ======================================
          MENU ITEMS
      ====================================== */}
      <nav className="flex-1 p-6">
        <div className="space-y-3">
          {menuItems.map(
            (item) =>
              (!item.adminOnly || role === "admin") && (
                <div
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                    currentPage === item.id
                      ? "bg-white/20 text-white shadow-xl scale-105 border-white/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-105 hover:border-white/20 border-transparent"
                  }`}
                >
                  <item.icon className="w-6 h-6" />

                  <span className="text-lg font-medium">
                    {item.label}
                  </span>
                </div>
              ),
          )}
        </div>

        {/* ====================================
            NOTIFICATIONS
        ==================================== */}
        <div className="mt-8 relative">
          {/* NOTIFICATION BUTTON */}
          <button
            onClick={toggleNotifications}
            className={`
              w-full
              flex
              items-center
              gap-4
              px-6
              py-4
              rounded-2xl
              text-white/80
              hover:text-white
              hover:bg-white/10
              border
              transition-all
              duration-300
              ${
                showNotifications
                  ? "bg-white/20 border-white/30"
                  : "border-transparent"
              }
            `}
          >
            <div className="relative">
              <Bell className="w-6 h-6" />

              {/* RED BADGE */}
              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-2
                    min-w-[20px]
                    h-5
                    px-1
                    rounded-full
                    bg-red-500
                    text-white
                    text-[10px]
                    font-bold
                    flex
                    items-center
                    justify-center
                    border-2
                    border-gray-900
                  "
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <span className="text-lg font-medium">
              Notifications
            </span>
          </button>

          {/* ==================================
              NOTIFICATION DROPDOWN
          ================================== */}
          {showNotifications && (
            <div
              className="
                absolute
                left-0
                top-full
                mt-3
                w-full
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
                  onClick={() => setShowNotifications(false)}
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
                <div className="px-4 py-3 border-b border-white/10">
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
                {notificationLoading ? (
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
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        px-4
                        py-4
                        border-b
                        border-white/5
                        transition
                        ${
                          Boolean(notification.is_read)
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
                              Boolean(notification.is_read)
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
                                Boolean(notification.is_read)
                                  ? "text-white/60"
                                  : "text-white"
                              }
                            `}
                          >
                            {notification.message}
                          </p>

                          <p className="text-white/30 text-xs mt-2">
                            {formatDate(notification.created_at)}
                          </p>

                          {/* MARK AS READ */}
                          {!Boolean(notification.is_read) && (
                            <button
                              onClick={() =>
                                markAsRead(notification.id)
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ======================================
          LOGOUT
      ====================================== */}
      <div className="p-6 border-t border-white/10">
        <button
          onClick={logout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            px-6
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-red-500/20
            to-pink-500/20
            text-white
            font-medium
            hover:from-red-500/40
            hover:to-pink-500/40
            hover:shadow-xl
            transform
            hover:-translate-y-1
            transition-all
            duration-300
            border
            border-white/10
          "
        >
          <LogOut className="w-6 h-6" />
          Logout
        </button>
      </div>
    </div>
  );
}