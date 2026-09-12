import db from "../config/db.js";

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================
export const getNotifications = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      id,
      user_id,
      message,
      type,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(
        "Error fetching notifications:",
        err
      );

      return res.status(500).json({
        message: "Error fetching notifications",
      });
    }

    res.json(results);
  });
};

// ==========================================
// GET MY UNREAD COUNT
// ==========================================
export const getUnreadCount = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT COUNT(*) AS unreadCount
    FROM notifications
    WHERE user_id = ?
      AND is_read = FALSE
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(
        "Error fetching unread count:",
        err
      );

      return res.status(500).json({
        message: "Error fetching unread count",
      });
    }

    res.json({
      unreadCount: results[0].unreadCount,
    });
  });
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================
export const markAsRead = (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  const sql = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ?
      AND user_id = ?
  `;

  db.query(
    sql,
    [notificationId, userId],
    (err, result) => {
      if (err) {
        console.error(
          "Error marking notification as read:",
          err
        );

        return res.status(500).json({
          message:
            "Error marking notification as read",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Notification not found or unauthorized",
        });
      }

      res.json({
        message: "Notification marked as read",
      });
    }
  );
};

// ==========================================
// MARK ALL MY NOTIFICATIONS AS READ
// ==========================================
export const markAllAsRead = (req, res) => {
  const userId = req.user.id;

  const sql = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err) => {
    if (err) {
      console.error(
        "Error marking all notifications as read:",
        err
      );

      return res.status(500).json({
        message:
          "Error marking all notifications as read",
      });
    }

    res.json({
      message:
        "All notifications marked as read",
    });
  });
};