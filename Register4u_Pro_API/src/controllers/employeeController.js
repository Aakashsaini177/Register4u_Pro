const { Employee } = require("../models");
const passwordManager = require("../utils/passwordManager");

// Get all employees with login information (for admin)
exports.getAllEmployees = async (req, res) => {
  try {
    console.log("📋 Fetching all employees with login info...");

    let query = {};

    if (req.body && req.body.search) {
      let searchTerm = req.body.search;
      const searchRegex = new RegExp(searchTerm, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { contact: searchRegex },
        { id: searchRegex },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    console.log(`✅ Found ${employees.length} employees`);

    // Decrypt passwords for admin view
    const employeesWithLoginInfo = employees.map((emp) => {
      const empData = { ...emp.toObject(), id: emp._id };

      // Decrypt password for admin visibility
      if (empData.password_plain) {
        empData.currentPassword = passwordManager.decryptForAdmin(
          empData.password_plain
        );
      } else {
        empData.currentPassword = empData.email || "Not Set"; // Default password is email
      }

      // Remove encrypted password from response
      delete empData.password_plain;
      delete empData.password; // Don't send hashed password

      return empData;
    });

    res.status(200).json({
      message: "Get All Employee",
      success: true,
      data: employeesWithLoginInfo,
    });
  } catch (error) {
    console.error("❌ Employee Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("📋 Fetching employee:", id);

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Get Employee",
      success: true,
      data: { ...employee.toObject(), id: employee._id },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Create employee
// Create employee
exports.createEmployee = async (req, res) => {
  try {
    console.log("📝 Creating employee:", req.body);

    let employeeData = { ...req.body };

    // Hash password if provided
    if (employeeData.password) {
      const passwordData = await passwordManager.preparePasswordData(
        employeeData.password
      );
      employeeData.password = passwordData.hashedPassword;
      employeeData.password_plain = passwordData.encryptedPassword;
      employeeData.login_enabled = true; // Auto-enable login if password provided
      employeeData.username = employeeData.email; // Default username to email
    }

    // Auto-set contact if missing
    if (employeeData.phone && !employeeData.contact) {
      employeeData.contact = employeeData.phone;
    }

    const employee = await Employee.create(employeeData);

    console.log("✅ Employee created:", employee._id);

    res.status(201).json({
      message: "Employee created successfully",
      success: true,
      data: { ...employee.toObject(), id: employee._id },
    });
  } catch (error) {
    console.error("❌ Create Employee Error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      success: true,
      data: { ...employee.toObject(), id: employee._id },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      message: "Employee deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Toggle employee login access (Admin only)
exports.toggleEmployeeLogin = async (req, res) => {
  try {
    const id = req.params.id;
    const { loginEnabled } = req.body;

    console.log(`🔐 Toggling login for employee ${id}: ${loginEnabled}`);

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    let updateData = { login_enabled: loginEnabled };

    // If enabling login for the first time, set up credentials
    if (loginEnabled && !employee.username) {
      if (!employee.email) {
        return res.status(400).json({
          message: "Employee must have email to enable login",
          success: false,
        });
      }

      const credentials = await passwordManager.setupDefaultCredentials(
        employee
      );
      updateData = { ...updateData, ...credentials };

      console.log(`✅ Set up login credentials for ${employee.fullName}`);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      message: `Login ${loginEnabled ? "enabled" : "disabled"} successfully`,
      success: true,
      data: {
        id: updatedEmployee._id,
        fullName: updatedEmployee.fullName,
        email: updatedEmployee.email,
        login_enabled: updatedEmployee.login_enabled,
        username: updatedEmployee.username,
      },
    });
  } catch (error) {
    console.error("❌ Toggle login error:", error.message);
    res.status(500).json({
      message: "Failed to toggle login access",
      success: false,
      error: error.message,
    });
  }
};

// Reset employee password (Admin only)
exports.resetEmployeePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { newPassword } = req.body;

    console.log(`🔑 Resetting password for employee ${id}`);

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    // Use email as default password if no new password provided
    const passwordToSet = newPassword || employee.email;
    const passwordData = await passwordManager.preparePasswordData(
      passwordToSet
    );

    await Employee.findByIdAndUpdate(id, {
      password: passwordData.hashedPassword,
      password_plain: passwordData.encryptedPassword,
      password_changed_at: new Date(),
      first_login: true, // Force password change on next login
    });

    console.log(`✅ Password reset for ${employee.fullName}`);

    res.status(200).json({
      message: "Password reset successfully",
      success: true,
      data: {
        newPassword: passwordToSet,
        message: "Employee will be prompted to change password on next login",
      },
    });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    res.status(500).json({
      message: "Failed to reset password",
      success: false,
      error: error.message,
    });
  }
};

// Get employee login history (Admin only)
exports.getEmployeeLoginHistory = async (req, res) => {
  try {
    const id = req.params.id;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    // For now, return basic login info
    // In a full implementation, you'd query a login_history collection
    res.status(200).json({
      message: "Employee login history",
      success: true,
      data: {
        employee: {
          id: employee._id,
          name: employee.fullName,
          email: employee.email,
        },
        loginInfo: {
          lastLogin: employee.last_login,
          loginAttempts: employee.login_attempts || 0,
          passwordChangedAt: employee.password_changed_at,
          firstLogin: employee.first_login,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get login history error:", error.message);
    res.status(500).json({
      message: "Failed to get login history",
      success: false,
    });
  }
};
