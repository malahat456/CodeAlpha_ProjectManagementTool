import db from "../config/db.js";

// Create Project
export const createProject = (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Project title is required" });
  }

  db.query(
    "INSERT INTO projects (title, description, admin_id) VALUES (?, ?, ?)",
    [title.trim(), description || "", req.user.id],
    (err, result) => {
      if (err) {
        console.error("Create project error:", err);
        return res.status(500).json({ message: err.message });
      }

      // Automatically add project admin as a member
      db.query(
        "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)",
        [result.insertId, req.user.id],
        (memberErr) => {
          if (memberErr) {
            console.error("Add project admin as member error:", memberErr);
          }

          db.query(
            "SELECT * FROM projects WHERE id = ?",
            [result.insertId],
            (err2, data) => {
              if (err2) {
                return res.status(500).json({ message: err2.message });
              }

              res.json(data[0]);
            }
          );
        }
      );
    }
  );
};


// Get Projects
// Admin: projects created by that admin
// Member: projects where the member is assigned
export const getProjects = (req, res) => {
  const userId = req.user.id;

  if (req.user.role === "admin") {
    db.query(
      "SELECT * FROM projects WHERE admin_id = ? ORDER BY id DESC",
      [userId],
      (err, data) => {
        if (err) {
          console.error("Get admin projects error:", err);
          return res.status(500).json({ message: err.message });
        }

        res.json(data);
      }
    );
  } else {
    db.query(
      `SELECT DISTINCT p.*
       FROM projects p
       INNER JOIN project_members pm
       ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY p.id DESC`,
      [userId],
      (err, data) => {
        if (err) {
          console.error("Get member projects error:", err);
          return res.status(500).json({ message: err.message });
        }

        res.json(data);
      }
    );
  }
};


// Get assigned projects for current user
export const getMemberProjects = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT DISTINCT p.*
     FROM projects p
     INNER JOIN project_members pm
     ON p.id = pm.project_id
     WHERE pm.user_id = ?
     ORDER BY p.id DESC`,
    [userId],
    (err, data) => {
      if (err) {
        console.error("Get member projects error:", err);
        return res.status(500).json({ message: err.message });
      }

      res.json(data);
    }
  );
};


// Update Project
// Only project admin can update
export const updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Project title is required" });
  }

  db.query(
    "SELECT admin_id FROM projects WHERE id = ?",
    [id],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (data.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (data[0].admin_id !== req.user.id) {
        return res.status(403).json({
          message: "Only the project admin can update this project",
        });
      }

      db.query(
        "UPDATE projects SET title = ?, description = ? WHERE id = ?",
        [title.trim(), description || "", id],
        (err2, result) => {
          if (err2) {
            return res.status(500).json({ message: err2.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
          }

          db.query(
            "SELECT * FROM projects WHERE id = ?",
            [id],
            (err3, updatedProject) => {
              if (err3) {
                return res.status(500).json({ message: err3.message });
              }

              res.json(updatedProject[0]);
            }
          );
        }
      );
    }
  );
};


// Delete Project
// Only project admin can delete
export const deleteProject = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT admin_id FROM projects WHERE id = ?",
    [id],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (data.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (data[0].admin_id !== req.user.id) {
        return res.status(403).json({
          message: "Only the project admin can delete this project",
        });
      }

      db.query(
        "DELETE FROM projects WHERE id = ?",
        [id],
        (err2, result) => {
          if (err2) {
            return res.status(500).json({ message: err2.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
          }

          res.json({
            message: "Project deleted successfully",
          });
        }
      );
    }
  );
};