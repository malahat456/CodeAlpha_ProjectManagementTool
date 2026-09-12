import db from "../config/db.js";

export const adminStats = (req, res) => {
  db.query(
    `SELECT 
      (SELECT COUNT(*) FROM projects) AS projects,
      (SELECT COUNT(*) FROM tasks) AS tasks,
      (SELECT COUNT(*) FROM users WHERE role='member') AS members`,
    (err, data) => res.json(data[0])
  );
};
