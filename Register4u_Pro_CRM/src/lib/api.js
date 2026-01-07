import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

// API Configuration from Environment Variables
  export const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL || "http://localhost:4002/api/v1";
  export const UPLOADS_BASE_URL =  import.meta.env.VITE_UPLOADS_BASE_URL || "http://localhost:4002/uploads";
  export const SERVER_BASE_URL =  import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:4002";
  export const PORTAL_API_BASE_URL =  import.meta.env.VITE_PORTAL_API_BASE_URL || "http://localhost:4002/api/v1/portal";

// Production URLs (Render.com) - Commented for local development
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://register4u-pro.onrender.com/api/v1";
// export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || "https://register4u-pro.onrender.com/uploads";
// export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "https://register4u-pro.onrender.com";
// export const PORTAL_API_BASE_URL = import.meta.env.VITE_PORTAL_API_BASE_URL || "https://register4u-pro.onrender.com/api/v1/portal";

// External Services URLs
export const QR_CODE_API =
  import.meta.env.VITE_QR_CODE_API ||
  "https://api.qrserver.com/v1/create-qr-code";
export const GOOGLE_FONTS_API =
  import.meta.env.VITE_GOOGLE_FONTS_API || "https://fonts.googleapis.com/css2";

// Legacy support - keeping old exports for backward compatibility
export const API_URL = API_BASE_URL; // For components using API_URL

// For old backend:
// export const API_BASE_URL = 'http://localhost:4001/api'
// For production:
// export const API_BASE_URL = 'https://uatapi.registration4u.in/api'
// export const UPLOADS_BASE_URL = 'https://uatapi.registration4u.in/uploads'

// Helper function to get full photo URL
export const getPhotoUrl = (photoPath) => {
  // Use the same logic as getImageUrl for consistency
  return getImageUrl(photoPath);
};

// Helper function to get image URL (handles both bulk and individual uploads)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Cloudinary or other absolute URLs - return as is
  if (imagePath.startsWith("http") || imagePath.startsWith("https"))
    return imagePath;

  // Clean the path
  let cleanPath = imagePath.replace(/\\/g, "/");

  // If it's already a full URL path starting with /uploads/, construct full URL
  if (cleanPath.startsWith("/uploads/")) {
    return `${SERVER_BASE_URL}${cleanPath}`;
  }

  // If it's just a filename, add to uploads (individual uploads)
  if (!cleanPath.includes("/")) {
    return `${UPLOADS_BASE_URL}/${cleanPath}`;
  }

  // For other paths that might include uploads/, construct full URL
  if (cleanPath.includes("uploads/")) {
    return `${SERVER_BASE_URL}/${cleanPath}`;
  }

  // Default: treat as filename in uploads
  return `${UPLOADS_BASE_URL}/${cleanPath}`;
};

// Helper function to get photo from file manager by name (specifically for bulk uploads)
export const getPhotoFromFileManager = async (photoName) => {
  if (!photoName) return null;

  try {
    // Get root level folders
    const response = await api.get("/files/list");
    const rootFolders = response.data.data || [];

    // Find photo folder at root level
    const photoFolder = rootFolders.find(
      (folder) =>
        folder.type === "folder" && folder.name.toLowerCase() === "photo"
    );

    if (!photoFolder) return null;

    // Get files from photo folder
    const photosResponse = await api.get("/files/list", {
      params: { parentId: photoFolder._id },
    });

    const photos = photosResponse.data.data || [];

    // Find photo by name (exact match or contains)
    const photo = photos.find(
      (p) =>
        p.type === "file" &&
        p.mimeType &&
        p.mimeType.startsWith("image/") &&
        (p.name === photoName ||
          p.name.includes(photoName.replace(/\.[^/.]+$/, "")) ||
          p.name === `${photoName}.jpg` ||
          p.name === `${photoName}.png` ||
          p.name === `${photoName}.jpeg`)
    );

    return photo
      ? photo.url.startsWith("http")
        ? photo.url
        : `${SERVER_BASE_URL}${photo.url}`
      : null;
  } catch (error) {
    console.error("Error fetching photo from file manager:", error);
    return null;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "123",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // 1. Try getting token from Store (Memory - Most Reliable)
    let token = useAuthStore.getState().token;

    // 2. Fallback to LocalStorage (Persisted)
    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Allow skipping default error handling
      if (error.config?.skipErrorHandling) {
        return Promise.reject(error);
      }

      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          toast.error(
            error.response.data?.message ||
              "Session expired. Please login again."
          );
          break;
        case 403:
          toast.error("You do not have permission to perform this action.");
          break;
        case 404:
          toast.error("Requested resource not found.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(error.response.data?.message || "Something went wrong.");
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (data) => api.post("/login", data),
  employeeLogin: (data) => api.post("/auth/employee-login", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  getProfile: () => api.get("/auth/profile"),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/me"),
  updatePreferences: (data) => api.put("/preferences", data),
  logScan: (data) => api.post("/recent-scans", data),
  forgotPassword: (data) => api.post("/forgotpasssword", data),
  resetPassword: (data) => api.post("/resetpassword", data),
};

export const dashboardAPI = {
  getDashboard: () => api.get("/dashboard"),
  getWeeklyVisitors: () => api.get("/dashboard/weekly-visitors"),
};

export const employeeAPI = {
  getAll: (data = {}) => api.post("/getAllEmployee", data),
  getById: (id) => api.get(`/employee/${id}`),
  create: (data) => api.post("/createemployee", data),
  update: (id, data) => api.post(`/updateemployee/${id}`, data),
  delete: (id) => api.post(`/deleteemployee/${id}`, {}),
  // Login management endpoints (Admin only)
  toggleLogin: (id, data) => api.post(`/employees/${id}/toggle-login`, data),
  resetPassword: (id, data) =>
    api.post(`/employees/${id}/reset-password`, data),
  getLoginHistory: (id) => api.get(`/employees/${id}/login-history`),
};

export const companyAPI = {
  getAll: () => api.get("/getallcompany"),
  getById: (id) => api.get(`/company/${id}`),
  create: (data) => api.post("/createcompany", data),
  update: (id, data) => api.post(`/companyupdate/${id}`, data),
  delete: (id) => api.post(`/deletecompany/${id}`, {}),
};

export const eventAPI = {
  getAll: (data = {}) => api.post("/getallevent", data),
  getById: (id) => api.get(`/event/${id}`),
  create: (data) => api.post("/createevent", data),
  update: (id, data) => api.post(`/updateevent/${id}`, data),
  delete: (id) => api.post(`/deleteevent/${id}`, {}),
};

export const visitorAPI = {
  getAll: (data = {}) => api.post("/getAllVisitors", data),
  getById: (id) => api.get(`/visitors/${id}`),
  create: (formData) =>
    api.post("/createvisitors", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.post(`/updatevisitors/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.post(`/deletevisitors/${id}`, {}),
  import: (formData) =>
    api.post("/visitors/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteMultiple: (data) => api.post("/deleteVisitors", data),
  export: (data) =>
    api.post("/exportVisitors", data, {
      responseType: "blob",
    }),
  bulkUpload: (formData) =>
    api.post("/addBulkEvent", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  // New methods
  scan: (visitorId) => api.post("/visitors/scan", { visitorId }),
  getDashboardStats: () => api.get("/visitors/dashboard/stats"),
  getHistory: (id) => api.get(`/visitors/${id}/history`),
};

export const categoryAPI = {
  getAll: () => api.get("/getallCategory"),
  create: (data) => api.post("/createCategory", data),
};

export const settingsAPI = {
  getBackgroundImage: () => api.get("/getBackImage"),
  updateBackgroundImage: (formData) =>
    api.post("/updateBackImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  createBackgroundImage: (formData) =>
    api.post("/createBackImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getSettings: () => api.get("/getSetting"),
  updateSettings: (data) => api.post("/updateSetting", data),
  createSettings: (data) => api.post("/createSetting", data),
  // New Portal Visibility Settings
  getPortalSettings: () => api.get("/settings/portal"),
  updatePortalSettings: (data) => api.put("/settings/portal", data),
  // Card Design Settings
  getCardDesignSettings: () => api.get("/settings/card-design"),
  updateCardDesignSettings: (data) => api.put("/settings/card-design", data),
};

export const photosAPI = {
  upload: (formData) =>
    api.post("/addPhoto", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const activityLogAPI = {
  getAll: (params) => api.get("/activity-logs", { params }),
  create: (data) => api.post("/activity-logs", data),
};

export const inviteAPI = {
  getAll: () => api.get("/invites"),
  getById: (id) => api.get(`/invites/${id}`),
  create: (data) => api.post("/invites", data),
  update: (id, data) => api.put(`/invites/${id}`, data),
  delete: (id) => api.delete(`/invites/${id}`),
  validate: (code) =>
    api.get(`/invites/validate/${code}`, { skipErrorHandling: true }),
};

export const barcodeAPI = {
  getBarcode: (id) => api.get(`/barcode-image/${id}`),
  getVisitorInfo: (id) => api.get(`/visitor-info/${id}`),
};

export const travelAPI = {
  getAll: (params) => api.get("/travel", { params }),
  getById: (id) => api.get(`/travel/${id}`),
  getByVisitorId: (visitorId) => api.get(`/travel/visitor/${visitorId}`),
  create: (data) => api.post("/travel", data),
  update: (id, data) => api.put(`/travel/${id}`, data),
  delete: (id) => api.delete(`/travel/${id}`),
  exportReport: (params) =>
    api.get("/travel/export", { params, responseType: "blob" }),
};

export const hotelAPI = {
  getAll: () => api.get("/hotels"),
  getById: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post("/hotels", data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
  getInventoryStatus: (date) =>
    api.get("/hotels/inventory-status", { params: { date } }),
  getAllotmentsByVisitorId: (visitorId) => 
    api.get(`/hotels/allotments/visitor/${visitorId}`, { skipErrorHandling: true }),
};

export const reportAPI = {
  getRoomCategorySummary: (eventId) =>
    api.get(`/events/${eventId}/reports/room-category-summary`),
  getPaxSummary: (eventId) => api.get(`/events/${eventId}/reports/pax-summary`),
  getHotelWiseSummary: (eventId) =>
    api.get(`/events/${eventId}/reports/hotel-wise-summary`),
  getDateWiseSummary: (eventId) =>
    api.get(`/events/${eventId}/reports/date-wise-summary`),
  getHotelContactSummary: (eventId) =>
    api.get(`/events/${eventId}/reports/hotel-contacts`),
};

// Drivers API
export const driverAPI = {
  getAll: () => api.get("/drivers"),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (formData) =>
    api.post("/drivers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/drivers/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/drivers/${id}`),
  getDailyReport: (date) =>
    api.get(`/drivers/reports/daily`, { params: { date } }),
  getWorkReport: (startDate, endDate) =>
    api.get(`/drivers/reports/work`, { params: { startDate, endDate } }),
  getAllotmentsByVisitorId: (visitorId) => 
    api.get(`/drivers/allotments/visitor/${visitorId}`, { skipErrorHandling: true }),
};

export const requirementAPI = {
  getAll: (params) => api.get("/requirements", { params }),
  create: (data) => api.post("/requirements", data),
  updateStatus: (id, data) => api.patch(`/requirements/${id}/status`, data),
  delete: (id) => api.delete(`/requirements/${id}`),
};

// File Manager API
export const fileManagerAPI = {
  // Get list of nodes in a folder (parentId can be null for root)
  list: (parentId = null) => {
    const params = parentId ? { parentId } : {};
    return api.get("/files/list", { params });
  },

  // Get photos from photo folder for visitor selection
  getPhotosFromPhotoFolder: async () => {
    try {
      // First get root folders
      const rootResponse = await api.get("/files/list");
      const rootFolders = rootResponse.data.data || [];
      
      // Find photo folder
      const photoFolder = rootFolders.find(folder => 
        folder.type === "folder" && folder.name.toLowerCase() === "photo"
      );
      
      if (!photoFolder) {
        return { data: { success: true, data: [] } };
      }
      
      // Get files from photo folder
      const photosResponse = await api.get("/files/list", { 
        params: { parentId: photoFolder._id } 
      });
      
      // Filter only image files
      const imageFiles = (photosResponse.data.data || []).filter(file => 
        file.type === "file" && file.mimeType && file.mimeType.startsWith("image/")
      );
      
      return { data: { success: true, data: imageFiles } };
    } catch (error) {
      console.error("Error fetching photos from photo folder:", error);
      return { data: { success: false, data: [] } };
    }
  },

  // Create a new folder
  createFolder: (name, parentId = null) => {
    return api.post("/files/folder", { name, parentId });
  },

  // Upload a file
  upload: (file, parentId = null) => {
    console.log("🚀 API upload called with:", { fileName: file.name, fileSize: file.size, fileType: file.type, parentId });
    
    const formData = new FormData();
    formData.append("file", file);
    if (parentId) formData.append("parentId", parentId);

    // Log FormData contents
    console.log("🚀 FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    console.log("🚀 Making API call to /files/upload");

    // Make the request - let axios handle Content-Type for FormData
    return api.post('/files/upload', formData).then(response => {
      console.log("🚀 Upload successful:", response.data);
      return response;
    }).catch(error => {
      console.error("🚀 Upload failed:", error);
      console.error("🚀 Error response:", error.response?.data);
      console.error("🚀 Error status:", error.response?.status);
      throw error;
    });
  },

  // Delete a node (file or folder)
  delete: (id) => api.delete(`/files/${id}`),

  // Rename a node
  rename: (id, name) => api.put(`/files/${id}/rename`, { name }),

  // Bulk delete nodes
  bulkDelete: (ids) => api.post("/files/bulk-delete", { ids }),

  // Bulk export selected files
  bulkExport: (ids) => api.post("/files/bulk-export", { ids }, { responseType: 'blob' }),

  // Seed defaults (auto-run if needed)
  seed: () => api.post("/files/seed"),

  // Reset and recreate defaults
  reset: () => api.post("/files/reset"),

  // Sync existing files to file manager
  syncExistingFiles: () => api.post("/files/sync-existing"),

  // Sync Cloudinary files to file manager
  syncCloudinaryFiles: () => api.post("/files/sync-cloudinary"),

  // Fix problematic files
  fixProblematicFiles: () => api.post("/files/fix-problematic"),
};

export default api;
