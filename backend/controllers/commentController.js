import db from "../config/db.js";

// ADD COMMENT
export const addComment = (req, res) => {
  const { task_id, project_id, message } = req.body;
  const user_id = req.user.id;

  if (!message?.trim()) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  if (!task_id && !project_id) {
    return res.status(400).json({
      message: "task_id or project_id is required",
    });
  }

  // If comment is for a task, check task/project access
  if (task_id) {
    db.query(
      `SELECT t.project_id, p.admin_id
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [task_id],
      (err, taskData) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        if (taskData.length === 0) {
          return res.status(404).json({
            message: "Task not found",
          });
        }

        const projectId = taskData[0].project_id;
        const projectAdmin = taskData[0].admin_id;

        checkProjectAccess(projectId, projectAdmin, user_id, (allowed) => {
          if (!allowed) {
            return res.status(403).json({
              message: "You are not a member of this project",
            });
          }

          insertComment();
        });
      }
    );
  } else {
    // Project comment
    db.query(
      "SELECT admin_id FROM projects WHERE id = ?",
      [project_id],
      (err, projectData) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        if (projectData.length === 0) {
          return res.status(404).json({
            message: "Project not found",
          });
        }

        checkProjectAccess(
          project_id,
          projectData[0].admin_id,
          user_id,
          (allowed) => {
            if (!allowed) {
              return res.status(403).json({
                message: "You are not a member of this project",
              });
            }

            insertComment();
          }
        );
      }
    );
  }

  function insertComment() {
    db.query(
      `INSERT INTO comments
       (task_id, project_id, user_id, message)
       VALUES (?, ?, ?, ?)`,
      [
        task_id || null,
        project_id || null,
        user_id,
        message.trim(),
      ],
      (err, result) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({
            message: "Database error",
          });
        }

        db.query(
          `SELECT c.*, u.name AS user_name
           FROM comments c
           JOIN users u ON c.user_id = u.id
           WHERE c.id = ?`,
          [result.insertId],
          (err, rows) => {
            if (err || rows.length === 0) {
              return res.status(500).json({
                message: "Error fetching comment",
              });
            }

            res.json(rows[0]);
          }
        );
      }
    );
  }
};


// CHECK PROJECT ACCESS
const checkProjectAccess = (
  projectId,
  projectAdminId,
  userId,
  callback
) => {
  // Project admin always has access
  if (projectAdminId === userId) {
    return callback(true);
  }

  // Check project_members table
  db.query(
    `SELECT id
     FROM project_members
     WHERE project_id = ?
     AND user_id = ?`,
    [projectId, userId],
    (err, data) => {
      if (err) {
        return callback(false);
      }

      callback(data.length > 0);
    }
  );
};


// GET COMMENTS
export const getComments = (req, res) => {
  const { task_id, project_id } = req.query;
  const userId = req.user.id;

  if (!task_id && !project_id) {
    return res.status(400).json({
      message: "task_id or project_id required",
    });
  }

  // Determine project
  if (task_id) {
    db.query(
      `SELECT t.project_id, p.admin_id
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [task_id],
      (err, taskData) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        if (taskData.length === 0) {
          return res.status(404).json({
            message: "Task not found",
          });
        }

        checkProjectAccess(
          taskData[0].project_id,
          taskData[0].admin_id,
          userId,
          (allowed) => {
            if (!allowed) {
              return res.status(403).json({
                message: "You are not a member of this project",
              });
            }

            fetchComments();
          }
        );
      }
    );
  } else {
    db.query(
      "SELECT admin_id FROM projects WHERE id = ?",
      [project_id],
      (err, projectData) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        if (projectData.length === 0) {
          return res.status(404).json({
            message: "Project not found",
          });
        }

        checkProjectAccess(
          project_id,
          projectData[0].admin_id,
          userId,
          (allowed) => {
            if (!allowed) {
              return res.status(403).json({
                message: "You are not a member of this project",
              });
            }

            fetchComments();
          }
        );
      }
    );
  }

  function fetchComments() {
    let query = `
      SELECT c.*, u.name AS user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (task_id) {
      query += " AND c.task_id = ?";
      params.push(task_id);
    }

    if (project_id) {
      query += " AND c.project_id = ?";
      params.push(project_id);
    }

    query += " ORDER BY c.created_at ASC";

    db.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      res.json(results);
    });
  }
};


// UPDATE COMMENT
// User can edit own comment
// Project admin can edit any comment in their project
export const updateComment = (req, res) => {
  const { message } = req.body;
  const commentId = req.params.id;
  const userId = req.user.id;

  if (!message?.trim()) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  db.query(
    `SELECT c.user_id, c.task_id, c.project_id,
            p.admin_id
     FROM comments c
     LEFT JOIN tasks t ON c.task_id = t.id
     LEFT JOIN projects p
       ON p.id = COALESCE(c.project_id, t.project_id)
     WHERE c.id = ?`,
    [commentId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Comment not found",
        });
      }

      const comment = results[0];

      if (
        comment.user_id !== userId &&
        comment.admin_id !== userId
      ) {
        return res.status(403).json({
          message: "Not authorized to edit this comment",
        });
      }

      db.query(
        "UPDATE comments SET message = ? WHERE id = ?",
        [message.trim(), commentId],
        (err2) => {
          if (err2) {
            return res.status(500).json({
              message: "Database error",
            });
          }

          db.query(
            `SELECT c.*, u.name AS user_name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [commentId],
            (err3, rows) => {
              if (err3 || rows.length === 0) {
                return res.status(500).json({
                  message: "Error fetching updated comment",
                });
              }

              res.json(rows[0]);
            }
          );
        }
      );
    }
  );
};


// DELETE COMMENT
// User can delete own comment
// Project admin can delete any comment in their project
export const deleteComment = (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  db.query(
    `SELECT c.user_id, p.admin_id
     FROM comments c
     LEFT JOIN tasks t ON c.task_id = t.id
     LEFT JOIN projects p
       ON p.id = COALESCE(c.project_id, t.project_id)
     WHERE c.id = ?`,
    [commentId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Comment not found",
        });
      }

      const comment = results[0];

      if (
        comment.user_id !== userId &&
        comment.admin_id !== userId
      ) {
        return res.status(403).json({
          message: "Not authorized to delete this comment",
        });
      }

      db.query(
        "DELETE FROM comments WHERE id = ?",
        [commentId],
        (err2) => {
          if (err2) {
            return res.status(500).json({
              message: "Database error",
            });
          }

          res.json({
            message: "Comment deleted",
          });
        }
      );
    }
  );
};