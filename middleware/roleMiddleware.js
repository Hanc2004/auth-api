// Usage: requireRole('admin') or requireRole('admin', 'user')
// Must run AFTER the `protect` middleware, since it relies on req.user
// (which `protect` attaches after verifying the JWT).
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = requireRole;