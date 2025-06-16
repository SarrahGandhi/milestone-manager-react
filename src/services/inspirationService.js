import { API_BASE_URL } from "../config";
import AuthService from "./authService";

export const uploadInspirationImage = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inspiration/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to upload image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const getInspirationImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inspiration`, {
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch images");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

export const getInspirationImagesByCategory = async (category) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspiration/category/${category}`,
      {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch images by category");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching images by category:", error);
    throw error;
  }
};

export const deleteInspirationImage = async (imageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inspiration/${imageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
