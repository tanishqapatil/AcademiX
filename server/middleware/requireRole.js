// server/middleware/requireRole.js
module.exports = function requireRole(role) {
  return function (req, res, next) {
    try {
      if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
};
