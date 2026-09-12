import multer from "multer";
import path from "path";
import db from "../config/db.js";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });


// CHECK PROJECT ACCESS
const checkProjectAccess = (
  projectId,
  userId,
  callback
) => {
  db.query(
    "SELECT admin_id FROM projects WHERE id = ?",
    [projectId],
    (err, projectData) => {
      if (err || projectData.length === 0) {
        return callback(false);
      }

      const adminId = projectData[0].admin_id;

      // Project admin
      if (adminId === userId) {
        return callback(true);
      }

      // Project member
      db.query(
        `SELECT id
         FROM project_members
         WHERE project_id = ?
         AND user_id = ?`,
        [projectId, userId],
        (memberErr, memberData) => {
          if (memberErr) {
            return callback(false);
          }

          callback(memberData.length > 0);
        }
      );
    }
  );
};


// UPLOAD FILE
export const uploadFile = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        message: "Upload error",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { task_id, project_id } = req.body;
    const user_id = req.user.id;

    if (!task_id && !project_id) {
      return res.status(400).json({
        message: "task_id or project_id is required",
      });
    }

    // Get project ID
    const getProjectId = (callback) => {
      if (project_id) {
        callback(project_id);
      } else {
        db.query(
          "SELECT project_id FROM tasks WHERE id = ?",
          [task_id],
          (taskErr, taskData) => {
            if (taskErr || taskData.length === 0) {
              callback(null);
            } else {
              callback(taskData[0].project_id);
            }
          }
        );
      }
    };

    getProjectId((projectId) => {
      if (!projectId) {
        return res.status(404).json({
          message: "Project or task not found",
        });
      }

      checkProjectAccess(projectId, user_id, (allowed) => {
        if (!allowed) {
          return res.status(403).json({
            message: "You are not a member of this project",
          });
        }

        const filename = req.file.filename;
        const original_name = req.file.originalname;
        const mimetype = req.file.mimetype;

        db.query(
          `INSERT INTO attachments
           (task_id, project_id, user_id, filename, original_name, mimetype)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            task_id || null,
            project_id || null,
            user_id,
            filename,
            original_name,
            mimetype,
          ],
          (dbErr, result) => {
            if (dbErr) {
              return res.status(500).json({
                message: dbErr.message,
              });
            }

            res.json({
              id: result.insertId,
              filename,
              original_name,
              mimetype,
              task_id: task_id || null,
              project_id: project_id || null,
            });
          }
        );
      });
    });
  });
};


// GET ATTACHMENTS
export const getAttachments = (req, res) => {
  const { task_id, project_id } = req.query;
  const userId = req.user.id;

  if (!task_id && !project_id) {
    return res.status(400).json({
      message: "task_id or project_id required",
    });
  }

  const getProjectId = (callback) => {
    if (project_id) {
      callback(project_id);
    } else {
      db.query(
        "SELECT project_id FROM tasks WHERE id = ?",
        [task_id],
        (err, data) => {
          if (err || data.length === 0) {
            callback(null);
          } else {
            callback(data[0].project_id);
          }
        }
      );
    }
  };

  getProjectId((projectId) => {
    if (!projectId) {
      return res.status(404).json({
        message: "Project or task not found",
      });
    }

    checkProjectAccess(projectId, userId, (allowed) => {
      if (!allowed) {
        return res.status(403).json({
          message: "You are not a member of this project",
        });
      }

      let query;
      let params;

      if (task_id) {
        query = `
          SELECT a.*, u.name AS user_name
          FROM attachments a
          JOIN users u ON a.user_id = u.id
          WHERE a.task_id = ?
          ORDER BY a.id ASC
        `;

        params = [task_id];
      } else {
        query = `
          SELECT a.*, u.name AS user_name
          FROM attachments a
          JOIN users u ON a.user_id = u.id
          WHERE a.project_id = ?
          ORDER BY a.id ASC
        `;

        params = [project_id];
      }

      db.query(query, params, (err, results) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        res.json(results);
      });
    });
  });
};


// DELETE ATTACHMENT
// Uploader or project admin can delete
export const deleteAttachment = (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  db.query(
    `SELECT a.user_id,
            COALESCE(a.project_id, t.project_id) AS project_id
     FROM attachments a
     LEFT JOIN tasks t ON a.task_id = t.id
     WHERE a.id = ?`,
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Attachment not found",
        });
      }

      const attachment = results[0];

      // Owner can delete
      if (attachment.user_id === userId) {
        return deleteFile();
      }

      // Check whether current user is project admin
      db.query(
        "SELECT admin_id FROM projects WHERE id = ?",
        [attachment.project_id],
        (projectErr, projectData) => {
          if (
            projectErr ||
            projectData.length === 0
          ) {
            return res.status(403).json({
              message: "Not authorized to delete this attachment",
            });
          }

          if (projectData[0].admin_id !== userId) {
            return res.status(403).json({
              message:
                "Only the uploader or project admin can delete this attachment",
            });
          }

          deleteFile();
        }
      );

      function deleteFile() {
        db.query(
          "DELETE FROM attachments WHERE id = ?",
          [id],
          (deleteErr) => {
            if (deleteErr) {
              return res.status(500).json({
                message: "Database error",
              });
            }

            res.json({
              message: "Attachment deleted",
            });
          }
        );
      }
    }
  );
};