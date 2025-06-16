import React from "react";
import { useAuth } from "../../context/AuthContext";

const RoleGuard = ({
  children,
  requireAdmin = false,
  requireUser = false,
  allowedRoles = [],
  fallback = null,
}) => {
  const { user, isAdmin, isUser } = useAuth();

  // If user is not authenticated, don't show anything
  if (!user) {
    return fallback;
  }

  // Check specific role requirements
  if (requireAdmin && !isAdmin()) {
    return fallback;
  }

  if (requireUser && !isUser()) {
    return fallback;
  }

  // Check if user's role is in allowed roles array
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  // If all checks pass, render children
  return children;
};

export default RoleGuard;
