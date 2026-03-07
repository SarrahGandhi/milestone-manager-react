const bcrypt = require("bcryptjs");
const { supabase } = require("../config/database");

class User {
  // Create a new user
  static async create(userData) {
    try {
      // Hash password before saving
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const insertData = {
        username: userData.username,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || "user",
        user_side: userData.side
          ? userData.side.charAt(0).toUpperCase() + userData.side.slice(1)
          : "Bride",
        is_active: userData.isActive !== undefined ? userData.isActive : true,
      };

      console.log("Attempting to insert user with data:", insertData);

      const { data, error } = await supabase
        .from("users")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return this.sanitizeUser(data);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.sanitizeUser(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email or username
  static async findByCredentials(identifier, password) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`email.eq.${identifier.toLowerCase()},username.eq.${identifier}`)
        .single();

      if (error || !data) {
        throw new Error("Invalid login credentials");
      }

      const isMatch = await bcrypt.compare(password, data.password);
      if (!isMatch) {
        throw new Error("Invalid login credentials");
      }

      // Update last login
      await this.updateLastLogin(data.id);

      return this.sanitizeUser(data);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? this.sanitizeUser(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? this.sanitizeUser(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, updates) {
    try {
      // If password is being updated, hash it
      if (updates.password) {
        const salt = await bcrypt.genSalt(12);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      Object.keys(updates).forEach((key) => {
        switch (key) {
          case "firstName":
            dbUpdates.first_name = updates[key];
            break;
          case "lastName":
            dbUpdates.last_name = updates[key];
            break;
          case "isActive":
            dbUpdates.is_active = updates[key];
            break;
          case "lastLogin":
            dbUpdates.last_login = updates[key];
            break;
          case "resetPasswordToken":
            dbUpdates.reset_password_token = updates[key];
            break;
          case "resetPasswordExpires":
            dbUpdates.reset_password_expires = updates[key];
            break;
          default:
            dbUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from("users")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.sanitizeUser(data);
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((user) => this.sanitizeUser(user));
    } catch (error) {
      throw error;
    }
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(id) {
    try {
      const { error } = await supabase
        .from("users")
        .update({ last_login: new Date() })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  // Remove sensitive data from user object
  static sanitizeUser(user) {
    if (!user) return null;

    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.reset_password_token;
    delete sanitized.reset_password_expires;

    // Convert snake_case back to camelCase for frontend
    if (sanitized.first_name) {
      sanitized.firstName = sanitized.first_name;
      delete sanitized.first_name;
    }
    if (sanitized.last_name) {
      sanitized.lastName = sanitized.last_name;
      delete sanitized.last_name;
    }
    if (sanitized.is_active !== undefined) {
      sanitized.isActive = sanitized.is_active;
      delete sanitized.is_active;
    }
    if (sanitized.last_login) {
      sanitized.lastLogin = sanitized.last_login;
      delete sanitized.last_login;
    }
    if (sanitized.created_at) {
      sanitized.createdAt = sanitized.created_at;
      delete sanitized.created_at;
    }
    if (sanitized.updated_at) {
      sanitized.updatedAt = sanitized.updated_at;
      delete sanitized.updated_at;
    }
    if (sanitized.user_side) {
      sanitized.side = sanitized.user_side.toLowerCase();
      delete sanitized.user_side;
    }

    return sanitized;
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  // Validate user data
  static validateUserData(userData) {
    const errors = [];

    if (
      !userData.username ||
      userData.username.length < 3 ||
      userData.username.length > 30
    ) {
      errors.push("Username must be between 3 and 30 characters");
    }

    if (!userData.email || !this.validateEmail(userData.email)) {
      errors.push("Please enter a valid email");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (!userData.firstName || userData.firstName.length > 50) {
      errors.push("First name is required and cannot exceed 50 characters");
    }

    if (!userData.lastName || userData.lastName.length > 50) {
      errors.push("Last name is required and cannot exceed 50 characters");
    }

    if (userData.role && !["user", "admin"].includes(userData.role)) {
      errors.push('Role must be either "user" or "admin"');
    }

    if (
      userData.side &&
      !["bride", "groom"].includes(userData.side.toLowerCase())
    ) {
      errors.push('Side must be either "bride" or "groom"');
    }

    return errors;
  }
}

module.exports = User;
