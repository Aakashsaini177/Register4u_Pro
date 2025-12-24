const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    contact: {
      type: String, // Alias for phone for compatibility
    },
    emp_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      default: "employee",
    },
    emp_type: {
      type: String,
      enum: [
        "permanent", // Legacy
        "employee", // New replacement for permanent
        "volunteer",
        "hospitality_desk",
        "travel_desk",
        "cab_assistance_desk",
        "help_desk",
      ],
      default: "permanent",
    },
    department: {
      type: String,
    },
    designation: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Login-related fields
    login_enabled: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness when present
    },
    password: {
      type: String, // Hashed password for authentication
    },
    password_plain: {
      type: String, // Encrypted password for admin visibility
    },
    last_login: {
      type: Date,
    },
    login_attempts: {
      type: Number,
      default: 0,
    },
    password_changed_at: {
      type: Date,
    },
    first_login: {
      type: Boolean,
      default: true,
    },
    login_created_at: {
      type: Date,
    },
    login_updated_at: {
      type: Date,
    },
    // Personal Details
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    location: {
      type: String, // Work location
    },
    // Documents
    pan_card: {
      type: String,
    },
    adhar_card: {
      type: String,
    },
    // Employment Details
    reporting_manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    joining_date: {
      type: Date,
    },
    ending_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for 'name' alias
employeeSchema.virtual("name").get(function () {
  return this.fullName;
});

// Pre-save middleware to set contact field and generate emp_code
employeeSchema.pre("save", async function (next) {
  // Set contact from phone if missing
  if (this.phone && !this.contact) {
    this.contact = this.phone;
  }

  // Generate random Employee Code if not set
  if (!this.emp_code) {
    let isUnique = false;
    while (!isUnique) {
      // Generate random 5 digit number
      // Generate random 5 digit number
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const code = `EMP${randomNum}`;

      // Check if code exists
      const existing = await mongoose.models.Employee.findOne({
        emp_code: code,
      });
      if (!existing) {
        this.emp_code = code;
        isUnique = true;
      }
    }
  }

  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
