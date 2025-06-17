import { getApiUrl } from "../config";

// Get authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem("milestone_manager_token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await fetch(getApiUrl("/auth/users"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get users");
    }

    return data;
  },

  // Create a new user
  createUser: async (userData) => {
    console.log("Creating user with data:", userData);
    console.log("API URL:", getApiUrl("/auth/users"));
    console.log("Headers:", getAuthHeaders());

    const response = await fetch(getApiUrl("/auth/users"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Create user response:", { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.message || "Failed to create user");
    }

    return data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await fetch(getApiUrl(`/auth/users/${userId}/role`), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update user role");
    }

    return data;
  },

  // Delete user
  deleteUser: async (userId) => {
    console.log("Deleting user with ID:", userId);
    console.log("API URL:", getApiUrl(`/auth/users/${userId}`));
    console.log("Headers:", getAuthHeaders());

    const response = await fetch(getApiUrl(`/auth/users/${userId}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    console.log("Delete user response:", { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete user");
    }

    return data;
  },
};

export default userService;
