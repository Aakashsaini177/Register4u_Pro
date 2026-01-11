const jwt = require("jsonwebtoken");
const { Employee } = require("../models");
const passwordManager = require("../utils/passwordManager");
const db = require("../config/database");

class AuthController {
  /**
   * Smart Auto-Detection Login (Admin, Employee, Driver, Hotel, Travel)
   */
  /**
   * Admin Login ONLY
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Check Admin Login
      if (username === "admin" && password === "admin123") {
        const adminId = "000000000000000000000001"; // Valid ObjectId length
        const token = jwt.sign(
          {
            id: adminId,
            username: "admin",
            role: "admin",
            type: "admin",
          },
          process.env.JWT_SECRET || "register4u-secret-key",
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          message: "Admin login successful",
          data: {
            token,
            user: {
              id: adminId,
              username: "admin",
              role: "admin",
              type: "admin",
              name: "Administrator",
            },
          },
        });
      }

      // If not admin, return unauthorized
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed due to server error",
      });
    }
  }

  /**
   * Get current user (admin or employee)
   */
  async getCurrentUser(req, res) {
    try {
      const user = req.user;

      if (user.type === "admin") {
        return res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              type: user.type,
            },
          },
        });
      }

      // For employees, get full profile
      return this.getProfile(req, res);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get current user",
      });
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req, res) {
    try {
      const { preferences } = req.body;
      const userId = req.user.id;

      // For now, just return success (can be implemented later)
      res.json({
        success: true,
        message: "Preferences updated successfully",
        data: { preferences },
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preferences",
      });
    }
  }

  /**
   * Log recent scan
   */
  async logRecentScan(req, res) {
    try {
      const { visitorId, scanType } = req.body;
      const userId = req.user.id;

      // For now, just return success (can be implemented later)
      res.json({
        success: true,
        message: "Recent scan logged successfully",
      });
    } catch (error) {
      console.error("Log recent scan error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to log recent scan",
      });
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // For now, just return success (can be implemented later)
      res.json({
        success: true,
        message: "Password reset instructions sent to your email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process forgot password request",
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // For now, just return success (can be implemented later)
      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password",
      });
    }
  }
  /**
   * Employee login
   */
  async employeeLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Find employee by username (email), code_id, or emp_code
      const employee = await Employee.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() },
          { code_id: username.toUpperCase() },
          { emp_code: username.toUpperCase() }
        ],
        login_enabled: true,
      });

      if (!employee) {
        // Log failed attempt (simplified)
        console.log(`Failed login attempt: ${username} from ${req.ip}`);

        return res.status(401).json({
          success: false,
          message: "Invalid credentials or login not enabled",
        });
      }

      // Verify password
      const isValidPassword = await passwordManager.verifyPassword(
        password,
        employee.password
      );

      if (!isValidPassword) {
        // Increment failed login attempts
        await employee.updateOne({
          login_attempts: employee.login_attempts + 1,
        });

        console.log(`Failed login attempt: ${username} from ${req.ip}`);

        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Determine role based on emp_type
      const role =
        employee.emp_type === "permanent" ? "permanent_employee" : "volunteer";

      // Generate JWT token
      const token = jwt.sign(
        {
          id: employee._id,
          email: employee.email,
          code_id: employee.code_id,
          role: role,
          type: "employee",
        },
        process.env.JWT_SECRET || "register4u-secret-key",
        { expiresIn: "24h" }
      );

      // Update last login and reset failed attempts
      await employee.updateOne({
        last_login: new Date(),
        login_attempts: 0,
      });

      // Skip session creation for now (MongoDB implementation needed)

      // Prepare response data
      const responseData = {
        token,
        employee: {
          id: employee._id,
          name: employee.fullName,
          email: employee.email,
          code_id: employee.code_id,
          emp_code: employee.emp_code,
          role: role,
          emp_type: employee.emp_type,
          firstLogin: employee.first_login,
          lastLogin: employee.last_login,
        },
      };

      res.json({
        success: true,
        message: "Login successful",
        data: responseData,
      });
    } catch (error) {
      console.error("Employee login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed due to server error",
      });
    }
  }

  /**
   * Change employee password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const employeeId = req.user.id; // From JWT middleware

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All password fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirmation do not match",
        });
      }

      // Find employee
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Verify current password
      const isValidCurrentPassword = await passwordManager.verifyPassword(
        currentPassword,
        employee.password
      );

      if (!isValidCurrentPassword) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Prepare new password data
      const passwordData = await passwordManager.preparePasswordData(
        newPassword
      );

      // Store old password for history
      const oldPasswordHash = employee.password;

      // Update employee password
      await employee.updateOne({
        password: passwordData.hashedPassword,
        password_plain: passwordData.encryptedPassword,
        password_changed_at: new Date(),
        first_login: false,
      });

      // Log password change
      await this.logPasswordChange(
        employeeId,
        oldPasswordHash,
        passwordData.hashedPassword,
        "employee",
        req.ip,
        req.get("User-Agent")
      );

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }

  /**
   * Get employee profile
   */
  async getProfile(req, res) {
    try {
      const employeeId = req.user.id;

      const employee = await Employee.findById(employeeId, {
        fullName: 1,
        email: 1,
        contact: 1,
        phone: 1,
        code_id: 1,
        emp_code: 1,
        emp_type: 1,
        department: 1,
        designation: 1,
        address: 1,
        status: 1,
        login_enabled: 1,
        last_login: 1,
        password_changed_at: 1,
        first_login: 1,
        dob: 1,
        gender: 1,
        city: 1,
        state: 1,
        pincode: 1,
        location: 1,
        pan_card: 1,
        adhar_card: 1,
        joining_date: 1,
        ending_date: 1,
        createdAt: 1,
        updatedAt: 1,
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.json({
        success: true,
        data: {
          employee: {
            id: employee._id,
            name: employee.fullName,
            email: employee.email,
            contact: employee.contact || employee.phone,
            phone: employee.phone,
            code_id: employee.code_id,
            emp_code: employee.emp_code,
            type: employee.emp_type,
            department: employee.department,
            designation: employee.designation,
            address: employee.address,
            status: employee.status,
            login_enabled: employee.login_enabled,
            lastLogin: employee.last_login,
            passwordChangedAt: employee.password_changed_at,
            firstLogin: employee.first_login,
            dob: employee.dob,
            gender: employee.gender,
            city: employee.city,
            state: employee.state,
            pincode: employee.pincode,
            location: employee.location,
            pan_card: employee.pan_card,
            adhar_card: employee.adhar_card,
            joining_date: employee.joining_date,
            ending_date: employee.ending_date,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
          },
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get profile",
      });
    }
  }

  /**
   * Employee logout
   */
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (token) {
        // Mark session as inactive
        await db.query(
          "UPDATE user_sessions SET is_active = FALSE, logout_time = NOW() WHERE session_token = ?",
          [token]
        );
      }

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  }

  // Helper methods

  async createSession(employeeId, token, role, ipAddress, userAgent) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      await db.query(
        `INSERT INTO user_sessions 
         (employee_id, session_token, role, ip_address, user_agent, expires_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employeeId, token, role, ipAddress, userAgent, expiresAt]
      );
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  }

  async logFailedLogin(username, ipAddress, userAgent) {
    try {
      // You could create a failed_logins table for this
      console.log(`Failed login attempt: ${username} from ${ipAddress}`);
    } catch (error) {
      console.error("Failed to log failed login:", error);
    }
  }

  async logPasswordChange(
    employeeId,
    oldPasswordHash,
    newPasswordHash,
    changedBy,
    ipAddress,
    userAgent
  ) {
    try {
      await db.query(
        `INSERT INTO password_history 
         (employee_id, old_password_hash, new_password_hash, changed_by, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          oldPasswordHash,
          newPasswordHash,
          changedBy,
          ipAddress,
          userAgent,
        ]
      );
    } catch (error) {
      console.error("Failed to log password change:", error);
    }
  }
}

module.exports = new AuthController();
