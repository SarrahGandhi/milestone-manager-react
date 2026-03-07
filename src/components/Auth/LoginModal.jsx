import React, { useState, useEffect } from "react";
import AuthService from "../../services/authService";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    email: "", // Changed from identifier to email
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    side: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await AuthService.login(formData);
      onLogin(response.user);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Login error:", error);

      // More specific error handling
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Invalid email/username or password")
      ) {
        setError(
          "The email or password you entered is incorrect. Please check your credentials and try again.",
        );
      } else if (
        error.message.includes("Network") ||
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch")
      ) {
        setError(
          "Connection error. Please check your internet connection and try again.",
        );
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = registerData;
      const response = await AuthService.register(registrationData);

      // If auto-login worked
      if (response.user) {
        onLogin(response.user);
        onClose();
        resetForm();
      } else {
        // If email confirmation is required
        setError("Please check your email to confirm your account.");
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (
        error.message.includes("User already registered") ||
        error.message.includes("exists")
      ) {
        setError(
          "An account with this email already exists. Please try logging in or use a different email.",
        );
      } else if (
        error.message.includes("Invalid email") ||
        error.message.includes("valid email")
      ) {
        setError("Please enter a valid email address.");
      } else if (error.message.includes("Password")) {
        setError("Password must be at least 6 characters long.");
      } else if (
        error.message.includes("Network") ||
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch")
      ) {
        setError(
          "Connection error. Please check your internet connection and try again.",
        );
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "" }); // Reset email instead of identifier
    setRegisterData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      side: "",
    });
    setError("");
    setShowRegister(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="login-modal auth-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header auth-modal-header">
          <h2>{showRegister ? "Sign up" : "Log in"}</h2>
          <button
            className="close-button auth-close-button"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {!showRegister ? (
            // Login Form
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Log in"}
              </button>

              <div className="form-footer">
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
                <div>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="switch-button"
                    onClick={() => setShowRegister(true)}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegister} className="auth-form register-form">
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min. 6 characters)"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <select
                  name="side"
                  value={registerData.side}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  placeholder="Select Side"
                  className="form-select"
                >
                  <option disabled value="">
                    Select Side
                  </option>
                  <option value="bride">Bride</option>
                  <option value="groom">Groom</option>
                </select>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>

              <div className="form-footer">
                <div>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="switch-button"
                    onClick={() => setShowRegister(false)}
                  >
                    Log in
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
