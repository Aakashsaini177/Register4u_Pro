const bcrypt = require('bcryptjs'); // Using bcryptjs instead of bcrypt for Windows compatibility
const CryptoJS = require('crypto-js');

class PasswordManager {
  constructor() {
    this.saltRounds = 12;
    this.adminViewKey = process.env.ADMIN_VIEW_KEY || 'register4u-admin-view-key-2024';
  }

  /**
   * Hash password for secure storage
   */
  async hashPassword(plainPassword) {
    try {
      return await bcrypt.hash(plainPassword, this.saltRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Encrypt password for admin visibility (reversible)
   */
  encryptForAdmin(plainPassword) {
    try {
      return CryptoJS.AES.encrypt(plainPassword, this.adminViewKey).toString();
    } catch (error) {
      throw new Error('Failed to encrypt password for admin view');
    }
  }

  /**
   * Decrypt password for admin display
   */
  decryptForAdmin(encryptedPassword) {
    try {
      if (!encryptedPassword) return '';
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.adminViewKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt password for admin view:', error);
      return '[Decryption Error]';
    }
  }

  /**
   * Generate default password (email)
   */
  generateDefaultPassword(email) {
    return email; // Default password is the email itself
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const errors = [];
    
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (password.length > 50) {
      errors.push('Password must be less than 50 characters');
    }
    
    // Allow any characters for flexibility
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare password data for database storage
   */
  async preparePasswordData(plainPassword) {
    const validation = this.validatePassword(plainPassword);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const hashedPassword = await this.hashPassword(plainPassword);
    const encryptedPassword = this.encryptForAdmin(plainPassword);

    return {
      hashedPassword,
      encryptedPassword,
      plainPassword // for immediate use, don't store this
    };
  }

  /**
   * Set up default login credentials for employee
   */
  async setupDefaultCredentials(employee) {
    if (!employee.email) {
      throw new Error('Employee must have email to set up login credentials');
    }

    const defaultPassword = this.generateDefaultPassword(employee.email);
    const passwordData = await this.preparePasswordData(defaultPassword);

    return {
      username: employee.email,
      password: passwordData.hashedPassword,
      password_plain: passwordData.encryptedPassword,
      login_enabled: true,
      first_login: true,
      password_changed_at: new Date(),
      login_created_at: new Date()
    };
  }
}

module.exports = new PasswordManager();