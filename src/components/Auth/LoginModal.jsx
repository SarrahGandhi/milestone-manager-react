import React, { useState } from "react";
import AuthService from "../../services/authService";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    identifier: "",
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
      if (error.message.includes("Invalid email/username or password")) {
        setError(
          "The email/username or password you entered is incorrect. Please check your credentials and try again."
        );
      } else if (error.message.includes("User not found")) {
        setError(
          "No account found with this email/username. Please check your email/username or sign up for a new account."
        );
      } else if (error.message.includes("Invalid password")) {
        setError("The password you entered is incorrect. Please try again.");
      } else if (error.message.includes("Account not verified")) {
        setError(
          "Please verify your account before logging in. Check your email for verification instructions."
        );
      } else if (error.message.includes("Account suspended")) {
        setError(
          "Your account has been suspended. Please contact support for assistance."
        );
      } else if (
        error.message.includes("Network") ||
        error.message.includes("fetch")
      ) {
        setError(
          "Connection error. Please check your internet connection and try again."
        );
      } else if (error.message.includes("Server error")) {
        setError(
          "Server temporarily unavailable. Please try again in a few minutes."
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
      onLogin(response.user);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Registration error:", error);

      // More specific error handling for registration
      if (
        error.message.includes(
          "User with this email or username already exists"
        )
      ) {
        setError(
          "An account with this email or username already exists. Please try logging in or use a different email/username."
        );
      } else if (error.message.includes("Username is already taken")) {
        setError(
          "This username is already taken. Please choose a different username."
        );
      } else if (error.message.includes("Invalid email")) {
        setError("Please enter a valid email address.");
      } else if (error.message.includes("Password")) {
        setError(
          "Password must be at least 6 characters long and contain both letters and numbers."
        );
      } else if (
        error.message.includes("Network") ||
        error.message.includes("fetch")
      ) {
        setError(
          "Connection error. Please check your internet connection and try again."
        );
      } else if (error.message.includes("Server error")) {
        setError(
          "Server temporarily unavailable. Please try again in a few minutes."
        );
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ identifier: "", password: "" });
    setRegisterData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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
                  type="text"
                  name="identifier"
                  placeholder="Email address"
                  value={formData.identifier}
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
