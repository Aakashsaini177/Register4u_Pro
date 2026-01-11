// Role-based authorization middleware

const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user is admin (from admin login) or has admin role
    const isAdmin = req.user.role === 'admin' || req.user.type === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Role auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

const requireEmployee = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Allow both admin and employee access
    const isAuthorized = req.user.role === 'admin' || 
                        req.user.type === 'admin' || 
                        req.user.type === 'employee';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Employee access required",
      });
    }

    next();
  } catch (error) {
    console.error("Role auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

const requirePermanentEmployee = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Allow admin or permanent employee
    const isAuthorized = req.user.role === 'admin' || 
                        req.user.type === 'admin' || 
                        (req.user.type === 'employee' && req.user.emp_type === 'permanent');
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Permanent employee access required",
      });
    }

    next();
  } catch (error) {
    console.error("Role auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

module.exports = {
  requireAdmin,
  requireEmployee,
  requirePermanentEmployee,
};