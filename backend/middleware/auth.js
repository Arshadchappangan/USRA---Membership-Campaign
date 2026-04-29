const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "usra_dev_secret_change_in_prod";

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireSelfOrAdmin(req, res, next) {
  const { id } = req.params;

  if (req.user.role === "admin" || req.user._id.toString() === id) {
    return next();
  }

  return res.status(403).json({ message: "You can only update your own profile." });
}

module.exports = { requireAuth, requireSelfOrAdmin };