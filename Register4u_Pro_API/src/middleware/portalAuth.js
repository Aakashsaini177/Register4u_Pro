const ensurePortalUser = (req, res, next) => {
  if (!req.user || req.user.userType !== 'portal') {
    return res.status(403).json({
      success: false,
      message: 'Portal authentication required'
    });
  }

  next();
};

const allowPortalRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this resource'
    });
  }

  next();
};

module.exports = {
  ensurePortalUser,
  allowPortalRoles
};


