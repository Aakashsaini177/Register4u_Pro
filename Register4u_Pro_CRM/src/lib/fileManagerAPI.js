import api from "./api";

export const fileManagerAPI = {
  // Get list of nodes in a folder (parentId can be null for root)
  // We pass it as query param
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
