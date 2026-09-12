import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hash, role],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json("Signup successful");
    }
  );
};

export const login = (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return res.status(500).json({ message: "Server configuration error" });
  }

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    (err, data) => {
      if (err) {
        console.error("Database error in login:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (data.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = data[0];

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      try {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        res.json({
          token,
          user: userWithoutPassword
        });
      } catch (tokenError) {
        console.error("JWT signing error:", tokenError);
        return res.status(500).json({ message: "Error generating token" });
      }
    }
  );
};