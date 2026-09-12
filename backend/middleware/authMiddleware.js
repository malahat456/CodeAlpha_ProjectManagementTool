import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  console.log("=== protect middleware called ===");
  console.log("Full headers:", req.headers); // ← یہ دیکھیں گے کہ header آ رہا ہے یا نہیں
  console.log("Authorization header:", req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    console.log("Bearer token found");
    token = req.headers.authorization.split(" ")[1];
    console.log("Extracted token:", token ? "Yes (hidden for security)" : "No");
  } else {
    console.log("No Bearer token found");
  }

  if (!token) {
    console.log("Sending 401 - No token");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully");
    console.log("Decoded user:", decoded); // ← یہ دیکھیں گے کہ role کیا آ رہا ہے

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};