import React, { createContext, useState, useContext, useEffect } from "react";
import AuthService from "../services/authService";
import supabase from "../utils/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    try {
      await AuthService.login(credentials);
      // The onAuthStateChange listener will automatically update the state
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      // The onAuthStateChange listener will automatically update the state
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Kept for backward compatibility if any component calls it directly
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
