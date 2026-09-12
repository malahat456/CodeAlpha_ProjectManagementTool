import mysql from "mysql2";

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project_management",
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

export default db;
