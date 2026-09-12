import db from "../config/db.js";

// ======================================================
// CREATE TASK
// ======================================================
export const createTask = (req, res) => {
  const { title, status, due_date, priority, project_id, user_id } =
    req.body;

  if (!title || !project_id || !user_id) {
    return res.status(400).json({
      message: "Title, project and assigned user are required",
    });
  }

  // ----------------------------------------------------
  // Check project exists and belongs to logged-in admin
  // ----------------------------------------------------
  const projectSql = `
    SELECT id, title, admin_id
    FROM projects
    WHERE id = ?
  `;

  db.query(projectSql, [project_id], (projectErr, projectResults) => {
    if (projectErr) {
      console.error("Error checking project:", projectErr);

      return res.status(500).json({
        message: "Error checking project",
      });
    }

    if (projectResults.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const project = projectResults[0];

    if (Number(project.admin_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "You can only create tasks in your own projects",
      });
    }

    // --------------------------------------------------
    // Check assigned user exists and is project member
    // --------------------------------------------------
    const memberSql = `
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN project_members pm
        ON pm.user_id = u.id
      WHERE pm.project_id = ?
        AND u.id = ?
    `;

    db.query(
      memberSql,
      [project_id, user_id],
      (memberErr, memberResults) => {
        if (memberErr) {
          console.error("Error checking project member:", memberErr);

          return res.status(500).json({
            message: "Error checking project member",
          });
        }

        if (memberResults.length === 0) {
          return res.status(400).json({
            message:
              "The selected user is not a member of this project",
          });
        }

        // ----------------------------------------------
        // Create task
        // ----------------------------------------------
        const taskSql = `
          INSERT INTO tasks
          (title, status, due_date, priority, project_id, user_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const taskStatus = status || "pending";
        const taskPriority = priority || "medium";

        db.query(
          taskSql,
          [
            title,
            taskStatus,
            due_date || null,
            taskPriority,
            project_id,
            user_id,
          ],
          (taskErr, taskResult) => {
            if (taskErr) {
              console.error("Error creating task:", taskErr);

              return res.status(500).json({
                message: "Error creating task",
              });
            }

            // ------------------------------------------
            // Create notification in database
            // ------------------------------------------
            const notificationMessage =
              `You have been assigned a new task: ${title}`;

            const notificationSql = `
              INSERT INTO notifications
              (user_id, message, type, is_read)
              VALUES (?, ?, ?, FALSE)
            `;

            db.query(
              notificationSql,
              [user_id, notificationMessage, "task_assigned"],
              (notificationErr, notificationResult) => {
                if (notificationErr) {
                  console.error(
                    "Error creating notification:",
                    notificationErr,
                  );
                } else {
                  // ------------------------------------
                  // REAL-TIME SOCKET.IO NOTIFICATION
                  // ------------------------------------
                  const io = req.app.get("io");

                  if (io) {
                    io.to(`user_${user_id}`).emit("notification", {
                      id: notificationResult.insertId,
                      user_id: user_id,
                      message: notificationMessage,
                      type: "task_assigned",
                      is_read: false,
                      created_at: new Date(),
                    });

                    console.log(
                      `Real-time notification sent to user ${user_id}`,
                    );
                  }
                }

                // --------------------------------------
                // Send response
                // --------------------------------------
                return res.status(201).json({
                  message: "Task created successfully",
                  taskId: taskResult.insertId,
                });
              },
            );
          },
        );
      },
    );
  });
};

// ======================================================
// GET ALL TASKS
// ======================================================
export const getTasks = (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let sql;
  let params;

  // ----------------------------------------------------
  // ADMIN
  // Admin sees tasks from projects they own
  // ----------------------------------------------------
  if (role === "admin") {
    sql = `
      SELECT
        t.*,
        p.title AS project_title
      FROM tasks t
      INNER JOIN projects p
        ON p.id = t.project_id
      WHERE p.admin_id = ?
      ORDER BY t.id DESC
    `;

    params = [userId];
  }

  // ----------------------------------------------------
  // MEMBER
  // Member sees only their own tasks
  // in projects where they are a member
  // ----------------------------------------------------
  else {
    sql = `
      SELECT
        t.*,
        p.title AS project_title
      FROM tasks t
      INNER JOIN projects p
        ON p.id = t.project_id
      INNER JOIN project_members pm
        ON pm.project_id = p.id
       AND pm.user_id = ?
      WHERE t.user_id = ?
      ORDER BY t.id DESC
    `;

    params = [userId, userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);

      return res.status(500).json({
        message: "Error fetching tasks",
      });
    }

    res.json(results);
  });
};

// ======================================================
// UPDATE TASK
// ======================================================
export const updateTask = (req, res) => {
  const taskId = req.params.id;

  const {
    title,
    status,
    due_date,
    priority,
    project_id,
    user_id,
  } = req.body;

  if (!title || !project_id || !user_id) {
    return res.status(400).json({
      message: "Title, project and assigned user are required",
    });
  }

  // ----------------------------------------------------
  // Get existing task
  // ----------------------------------------------------
  const taskSql = `
    SELECT
      t.*,
      p.admin_id,
      p.title AS project_title
    FROM tasks t
    INNER JOIN projects p
      ON p.id = t.project_id
    WHERE t.id = ?
  `;

  db.query(taskSql, [taskId], (taskErr, taskResults) => {
    if (taskErr) {
      console.error("Error fetching task:", taskErr);

      return res.status(500).json({
        message: "Error fetching task",
      });
    }

    if (taskResults.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const existingTask = taskResults[0];

    // ----------------------------------------------------
    // Only project admin can edit task details
    // ----------------------------------------------------
    if (Number(existingTask.admin_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Only the project admin can edit task details",
      });
    }

    // ----------------------------------------------------
    // Verify selected user is project member
    // ----------------------------------------------------
    const memberSql = `
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN project_members pm
        ON pm.user_id = u.id
      WHERE pm.project_id = ?
        AND u.id = ?
    `;

    db.query(
      memberSql,
      [project_id, user_id],
      (memberErr, memberResults) => {
        if (memberErr) {
          console.error("Error checking project member:", memberErr);

          return res.status(500).json({
            message: "Error checking project member",
          });
        }

        if (memberResults.length === 0) {
          return res.status(400).json({
            message:
              "The selected user is not a member of this project",
          });
        }

        // ----------------------------------------------
        // Update task
        // ----------------------------------------------
        const updateSql = `
          UPDATE tasks
          SET
            title = ?,
            status = ?,
            due_date = ?,
            priority = ?,
            project_id = ?,
            user_id = ?
          WHERE id = ?
        `;

        db.query(
          updateSql,
          [
            title,
            status || "pending",
            due_date || null,
            priority || "medium",
            project_id,
            user_id,
            taskId,
          ],
          (updateErr) => {
            if (updateErr) {
              console.error("Error updating task:", updateErr);

              return res.status(500).json({
                message: "Error updating task",
              });
            }

            // ------------------------------------------
            // If assignee changed → notification
            // ------------------------------------------
            const oldUserId = Number(existingTask.user_id);
            const newUserId = Number(user_id);

            if (oldUserId !== newUserId) {
              const notificationMessage =
                `You have been assigned a task: ${title}`;

              const notificationSql = `
                INSERT INTO notifications
                (user_id, message, type, is_read)
                VALUES (?, ?, ?, FALSE)
              `;

              db.query(
                notificationSql,
                [
                  newUserId,
                  notificationMessage,
                  "task_assigned",
                ],
                (notificationErr, notificationResult) => {
                  if (notificationErr) {
                    console.error(
                      "Error creating notification:",
                      notificationErr,
                    );
                  } else {
                    // --------------------------------
                    // REAL-TIME SOCKET.IO NOTIFICATION
                    // --------------------------------
                    const io = req.app.get("io");

                    if (io) {
                      io.to(`user_${newUserId}`).emit(
                        "notification",
                        {
                          id: notificationResult.insertId,
                          user_id: newUserId,
                          message: notificationMessage,
                          type: "task_assigned",
                          is_read: false,
                          created_at: new Date(),
                        },
                      );

                      console.log(
                        `Real-time notification sent to user ${newUserId}`,
                      );
                    }
                  }

                  return res.json({
                    message: "Task updated successfully",
                  });
                },
              );
            } else {
              return res.json({
                message: "Task updated successfully",
              });
            }
          },
        );
      },
    );
  });
};

// ======================================================
// GET MEMBER TASKS
// ======================================================
export const getMemberTasks = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      t.*,
      p.title AS project_title
    FROM tasks t
    INNER JOIN projects p
      ON p.id = t.project_id
    INNER JOIN project_members pm
      ON pm.project_id = p.id
     AND pm.user_id = ?
    WHERE t.user_id = ?
    ORDER BY t.id DESC
  `;

  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching member tasks:", err);

      return res.status(500).json({
        message: "Error fetching member tasks",
      });
    }

    res.json(results);
  });
};

// ======================================================
// UPDATE TASK STATUS
// ======================================================
export const updateTaskStatus = (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "in-progress",
    "completed",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid task status",
    });
  }

  // ----------------------------------------------------
  // Get task + project information
  // ----------------------------------------------------
  const taskSql = `
    SELECT
      t.*,
      p.admin_id
    FROM tasks t
    INNER JOIN projects p
      ON p.id = t.project_id
    WHERE t.id = ?
  `;

  db.query(taskSql, [taskId], (taskErr, taskResults) => {
    if (taskErr) {
      console.error("Error fetching task:", taskErr);

      return res.status(500).json({
        message: "Error fetching task",
      });
    }

    if (taskResults.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const task = taskResults[0];
    const userId = Number(req.user.id);

    // ----------------------------------------------------
    // ADMIN
    // ----------------------------------------------------
    if (
      req.user.role === "admin" &&
      Number(task.admin_id) === userId
    ) {
      const updateSql = `
        UPDATE tasks
        SET status = ?
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [status, taskId],
        (updateErr) => {
          if (updateErr) {
            console.error(
              "Error updating task status:",
              updateErr,
            );

            return res.status(500).json({
              message: "Error updating task status",
            });
          }

          return res.json({
            message: "Task status updated successfully",
          });
        },
      );

      return;
    }

    // ----------------------------------------------------
    // MEMBER
    // Member can update only their own task
    // ----------------------------------------------------
    if (
      req.user.role === "member" &&
      Number(task.user_id) === userId
    ) {
      const memberSql = `
        SELECT id
        FROM project_members
        WHERE project_id = ?
          AND user_id = ?
      `;

      db.query(
        memberSql,
        [task.project_id, userId],
        (memberErr, memberResults) => {
          if (memberErr) {
            console.error(
              "Error checking project membership:",
              memberErr,
            );

            return res.status(500).json({
              message: "Error checking project membership",
            });
          }

          if (memberResults.length === 0) {
            return res.status(403).json({
              message: "You are not a member of this project",
            });
          }

          const updateSql = `
            UPDATE tasks
            SET status = ?
            WHERE id = ?
          `;

          db.query(
            updateSql,
            [status, taskId],
            (updateErr) => {
              if (updateErr) {
                console.error(
                  "Error updating task status:",
                  updateErr,
                );

                return res.status(500).json({
                  message: "Error updating task status",
                });
              }

              return res.json({
                message:
                  "Task status updated successfully",
              });
            },
          );
        },
      );

      return;
    }

    // ----------------------------------------------------
    // ACCESS DENIED
    // ----------------------------------------------------
    return res.status(403).json({
      message: "You are not authorized to update this task",
    });
  });
};

// ======================================================
// DELETE TASK
// ======================================================
export const deleteTask = (req, res) => {
  const taskId = req.params.id;

  const taskSql = `
    SELECT
      t.id,
      p.admin_id
    FROM tasks t
    INNER JOIN projects p
      ON p.id = t.project_id
    WHERE t.id = ?
  `;

  db.query(taskSql, [taskId], (taskErr, taskResults) => {
    if (taskErr) {
      console.error("Error fetching task:", taskErr);

      return res.status(500).json({
        message: "Error fetching task",
      });
    }

    if (taskResults.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const task = taskResults[0];

    if (Number(task.admin_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Only the project admin can delete tasks",
      });
    }

    const deleteSql = `
      DELETE FROM tasks
      WHERE id = ?
    `;

    db.query(deleteSql, [taskId], (deleteErr) => {
      if (deleteErr) {
        console.error("Error deleting task:", deleteErr);

        return res.status(500).json({
          message: "Error deleting task",
        });
      }

      return res.json({
        message: "Task deleted successfully",
      });
    });
  });
};