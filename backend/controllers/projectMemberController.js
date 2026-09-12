import db from "../config/db.js";

// ================= ADD MEMBER TO PROJECT =================
export const addProjectMember = (req, res) => {
  const { project_id, user_id } = req.body;

  if (!project_id || !user_id) {
    return res.status(400).json({
      message: "Project ID and User ID are required",
    });
  }

  // Only project admin/owner can add members
  db.query(
    "SELECT admin_id FROM projects WHERE id = ?",
    [project_id],
    (err, projects) => {
      if (err) {
        console.error("Error checking project:", err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (projects.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      if (
        req.user.role !== "admin" ||
        projects[0].admin_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "Only the project admin can add members",
        });
      }

      // Check whether user already exists in project
      db.query(
        "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
        [project_id, user_id],
        (err, existing) => {
          if (err) {
            console.error("Error checking member:", err);
            return res.status(500).json({
              message: "Database error",
            });
          }

          if (existing.length > 0) {
            return res.status(400).json({
              message: "User is already a member of this project",
            });
          }

          db.query(
            "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)",
            [project_id, user_id],
            (err, result) => {
              if (err) {
                console.error("Error adding member:", err);
                return res.status(500).json({
                  message: "Error adding project member",
                });
              }

              res.status(201).json({
                message: "Member added successfully",
                id: result.insertId,
              });
            }
          );
        }
      );
    }
  );
};

// ================= GET PROJECT MEMBERS =================
export const getProjectMembers = (req, res) => {
  const { project_id } = req.query;

  if (!project_id) {
    return res.status(400).json({
      message: "Project ID is required",
    });
  }

  const sql = `
    SELECT 
      pm.id,
      pm.project_id,
      pm.user_id,
      pm.joined_at,
      u.name,
      u.email,
      u.role
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY u.name ASC
  `;

  db.query(sql, [project_id], (err, results) => {
    if (err) {
      console.error("Error fetching project members:", err);
      return res.status(500).json({
        message: "Error fetching project members",
      });
    }

    res.json(results);
  });
};

// ================= REMOVE MEMBER =================
export const removeProjectMember = (req, res) => {
  const memberId = req.params.id;

  db.query(
    `
    SELECT pm.project_id, p.admin_id
    FROM project_members pm
    JOIN projects p ON pm.project_id = p.id
    WHERE pm.id = ?
    `,
    [memberId],
    (err, results) => {
      if (err) {
        console.error("Error checking member:", err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Project member not found",
        });
      }

      if (
        req.user.role !== "admin" ||
        results[0].admin_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "Only the project admin can remove members",
        });
      }

      db.query(
        "DELETE FROM project_members WHERE id = ?",
        [memberId],
        (err) => {
          if (err) {
            console.error("Error removing member:", err);
            return res.status(500).json({
              message: "Error removing project member",
            });
          }

          res.json({
            message: "Member removed successfully",
          });
        }
      );
    }
  );
};