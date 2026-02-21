const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Check if user exists (should be attached by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Access denied. ${requiredRole} role required.` 
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
