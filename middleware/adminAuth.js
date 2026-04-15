import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      console.log("Admin Auth Failed: No token provided");
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const adminId = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;

    if (decodedToken !== adminId) {
      console.log("Admin Auth Failed: Token mismatch");
      return res.status(401).json({ success: false, message: "Unauthorized Access!" });
    }

    console.log("Admin Auth Success: Token verified");
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

export default adminAuth;
