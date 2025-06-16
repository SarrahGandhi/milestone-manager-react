import React, { createContext, useState, useContext, useEffect } from "react";
import AuthService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.validateToken();
      if (authenticated) {
        const userData = AuthService.getUser();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const result = await AuthService.login(credentials);
      await checkAuthStatus();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Role-based access control helpers
  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAdmin = () => {
    return hasRole("admin");
  };

  const isUser = () => {
    return hasRole("user");
  };

  const canEdit = () => {
    return isAdmin();
  };

  const canAdd = () => {
    return isAdmin();
  };

  const canDelete = () => {
    return isAdmin();
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuthStatus,
    // Role-based access methods
    hasRole,
    isAdmin,
    isUser,
    canEdit,
    canAdd,
    canDelete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
