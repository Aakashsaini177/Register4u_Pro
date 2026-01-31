const jwt = require("jsonwebtoken");

// FORCE SECRET FOR DEBUGGING if env is missing
const JWT_SECRET = process.env.JWT_SECRET || "register4u-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Verification failed:", error.message);
    throw error; // Throw original error to see if it is 'jwt expired' or 'invalid signature'
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
