// middleware/auth.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'usra_dev_secret_change_in_prod';

/**
 * requireAuth
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorised — no token provided.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * requireSelfOrAdmin
 * Must be used AFTER requireAuth.
 * Allows the request only if:
 *   - the authenticated user is an admin, OR
 *   - the authenticated user's MongoDB _id matches the :id param
 */
function requireSelfOrAdmin(req, res, next) {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'admin';
  const isSelf  = req.user?._id?.toString() === id;

  if (isAdmin || isSelf) return next();

  return res.status(403).json({
    success: false,
    message: 'Forbidden — you can only update your own profile.',
  });
}

module.exports = { requireAuth, requireSelfOrAdmin };