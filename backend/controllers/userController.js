import db from "../config/db.js";

export const getUsers = (req, res) => {
  const sql = `
    SELECT id, name, email, role
    FROM users
    ORDER BY name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({
        message: "Error fetching users"
      });
    }

    res.json(results);
  });
};