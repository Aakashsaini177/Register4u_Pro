import { useState, useEffect } from "react";
import { fileManagerAPI } from "@/lib/fileManagerAPI";
import { SERVER_BASE_URL, getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import toast from "react-hot-toast";
import {
  FolderIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
  PencilIcon,
  HomeIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { FolderIcon as FolderSolid } from "@heroicons/react/24/solid";

const FileManager = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderStack, setFolderStack] = useState([{ id: null, name: "Files" }]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [renamingNode, setRenamingNode] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    fetchNodes();
  }, [currentFolder]);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const response = await fileManagerAPI.list(currentFolder);
      if (response.data.success) {
        let fetchedNodes = response.data.data;

        // If root and empty, seed default folders
        if (!currentFolder && fetchedNodes.length === 0) {
          await fileManagerAPI.seed();
          const retry = await fileManagerAPI.list(null);
          fetchedNodes = retry.data.data;
        }

        setNodes(fetchedNodes);
      }
    } catch (error) {
      console.error("FileManager Error:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder._id);
    setFolderStack([...folderStack, { id: folder._id, name: folder.name }]);
    setSelectedNodes([]);
  };

  const handleBreadcrumbClick = (index) => {
    const newStack = folderStack.slice(0, index + 1);
    const targetFolder = newStack[newStack.length - 1];
    setCurrentFolder(targetFolder.id);
    setFolderStack(newStack);
    setSelectedNodes([]);
  };

  const handleUpload = async (e) => {
    console.log("Upload handler triggered!");
    const files = e.target.files;
    console.log("Files selected:", files?.length || 0);

    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    // Log file details
    for (let i = 0; i < files.length; i++) {
      console.log(`File ${i + 1}:`, {
        name: files[i].name,
        size: files[i].size,
        type: files[i].type,
        lastModified: files[i].lastModified,
      });
    }

    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

    try {
      // 1. Create array of upload promises
      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          // Log detailed progress could be added here if needed
          const result = await fileManagerAPI.upload(file, currentFolder);
          console.log(`✅ Uploaded ${file.name}`);
          return { success: true, name: file.name, result };
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);
          return { success: false, name: file.name, error };
        }
      });

      // 2. Wait for all to finish (parallel execution)
      const results = await Promise.all(uploadPromises);

      // 3. Tally results
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(
          `Uploaded ${successCount} file(s)${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`,
          { id: toastId }
        );
        // Refresh immediately
        fetchNodes();
      } else {
        toast.error("All uploads failed", { id: toastId });
      }
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error("Upload failed: " + (error.message || "Unknown error"), {
        id: toastId,
      });
    }

    // Reset the input value to allow same file to be selected again
    e.target.value = null;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await fileManagerAPI.createFolder(newFolderName.trim(), currentFolder);
      toast.success("Folder created");
      setNewFolderName("");
      setShowNewFolderInput(false);
      fetchNodes();
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleRename = async (node) => {
    setRenamingNode(node._id);
    setRenameValue(node.name);
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim()) return;

    try {
      await fileManagerAPI.rename(renamingNode, renameValue.trim());
      toast.success("Renamed successfully");
      setRenamingNode(null);
      setRenameValue("");
      fetchNodes();
    } catch (error) {
      toast.error("Failed to rename");
    }
  };

  const handleRenameCancel = () => {
    setRenamingNode(null);
    setRenameValue("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await fileManagerAPI.delete(id);
      toast.success("Deleted successfully");
      fetchNodes();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNodes.length === 0) return;
    if (!window.confirm(`Delete ${selectedNodes.length} selected items?`))
      return;

    try {
      const response = await fileManagerAPI.bulkDelete(selectedNodes);
      toast.success(response.data.message);
      setSelectedNodes([]);
      fetchNodes();
    } catch (error) {
      toast.error("Bulk delete failed");
    }
  };

  const handleBulkExport = async () => {
    if (selectedNodes.length === 0) return;
    
    const toastId = toast.loading(`Preparing ${selectedNodes.length} files for export...`);
    
    try {
      const response = await fileManagerAPI.bulkExport(selectedNodes);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.setAttribute('download', `exported-files-${timestamp}.zip`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      toast.success(`Successfully exported ${selectedNodes.length} files`, { id: toastId });
      setSelectedNodes([]); // Clear selection after export
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export files: " + (error.response?.data?.message || error.message), { id: toastId });
    }
  };

  const toggleSelectNode = (nodeId) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNodes.length === nodes.length) {
      setSelectedNodes([]);
    } else {
      setSelectedNodes(nodes.map((node) => node._id));
    }
  };

  const getFileIcon = (node) => {
    if (node.type === "folder") {
      return <FolderSolid className="h-8 w-8 text-blue-500" />;
    }

    if (node.mimeType?.startsWith("image/")) {
      // Use helper to resolve URL (handles Cloudinary, local paths, and filenames)
      const imageUrl = getImageUrl(node.url);

      return (
        <div className="h-8 w-8 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={node.name}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
            }}
          />
        </div>
      );
    }

    // Different icons for different file types
    if (node.mimeType?.startsWith("video/")) {
      return <VideoCameraIcon className="h-8 w-8 text-purple-500" />;
    }

    if (node.mimeType?.startsWith("audio/")) {
      return <MusicalNoteIcon className="h-8 w-8 text-green-500" />;
    }

    if (node.mimeType === "application/pdf") {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    }

    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            File Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your files and folders
          </p>
        </div>

        <div className="flex gap-2">
          {selectedNodes.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleBulkExport}
                className="flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export ({selectedNodes.length})
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete ({selectedNodes.length})
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            New Folder
          </Button>

          <div>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                console.log("Upload button clicked");
                document.getElementById("file-upload").click();
              }}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <HomeIcon className="h-4 w-4" />
        {folderStack.map((folder, index) => (
          <div key={folder.id || "root"} className="flex items-center gap-2">
            {index > 0 && <ChevronRightIcon className="h-4 w-4" />}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className="hover:text-gray-900 dark:hover:text-gray-100 hover:underline"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
            className="flex-1"
          />
          <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
            Create
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowNewFolderInput(false);
              setNewFolderName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* File Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Header with select all */}
        {nodes.length > 0 && (
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <Checkbox
              checked={selectedNodes.length === nodes.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedNodes.length > 0
                ? `${selectedNodes.length} selected`
                : "Select all"}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {nodes.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                This folder is empty
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {nodes.map((node) => (
                <div
                  key={node._id}
                  className={`group relative p-3 rounded-lg border-2 transition-all ${
                    selectedNodes.includes(node._id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {/* Selection checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedNodes.includes(node._id)}
                      onCheckedChange={() => toggleSelectNode(node._id)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleRename(node)}
                        className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700"
                        title="Rename"
                      >
                        <PencilIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(node._id)}
                        className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => {
                      if (node.type === "folder") {
                        handleFolderClick(node);
                      } else if (node.mimeType?.startsWith("image/")) {
                        // Open image in new tab for viewing
                        const imageUrl = getImageUrl(node.url);
                        window.open(imageUrl, "_blank");
                      }
                    }}
                  >
                    {getFileIcon(node)}

                    {renamingNode === node._id ? (
                      <div className="w-full">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleRenameSubmit();
                            if (e.key === "Escape") handleRenameCancel();
                          }}
                          onBlur={handleRenameSubmit}
                          className="text-xs text-center"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-center text-gray-700 dark:text-gray-300 break-words w-full">
                        {node.name}
                      </span>
                    )}

                    {node.type === "file" && (
                      <span className="text-xs text-gray-500">
                        {(node.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
