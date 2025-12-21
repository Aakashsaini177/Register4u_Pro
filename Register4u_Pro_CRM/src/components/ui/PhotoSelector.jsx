import React, { useState, useEffect } from "react";
import { fileManagerAPI } from "@/lib/fileManagerAPI";
import { SERVER_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const PhotoSelector = ({
  label = "Select Photo",
  value,
  onChange,
  error,
  required = false,
}) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (showSelector) {
      fetchPhotos();
    }
  }, [showSelector]);

  useEffect(() => {
    // If value is provided, find the corresponding photo
    if (value && photos.length > 0) {
      const photo = photos.find((p) => p.url === value || p._id === value);
      setSelectedPhoto(photo);
    }
  }, [value, photos]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fileManagerAPI.getPhotosFromPhotoFolder();
      if (response.data.success) {
        setPhotos(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (photo) => {
    setSelectedPhoto(photo);
    onChange(photo.url); // Pass the photo URL to parent
    setShowSelector(false);
  };

  const handleUploadNew = () => {
    // Open file manager in new tab/window to photo folder
    window.open("/file-manager?folder=photo", "_blank");
    toast.info("Upload new photos in File Manager, then refresh this selector");
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Selected Photo Display */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        {selectedPhoto ? (
          <div className="flex items-center gap-4">
            <img
              src={`${SERVER_BASE_URL}${selectedPhoto.url}`}
              alt={selectedPhoto.name}
              className="w-16 h-16 object-cover rounded-lg border"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedPhoto.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedPhoto.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSelector(true)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">No photo selected</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSelector(true)}
            >
              Select Photo
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Photo Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Photo</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadNew}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Upload New
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchPhotos}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSelector(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading photos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-8">
                <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  No photos found in photo folder
                </p>
                <Button type="button" onClick={handleUploadNew}>
                  Upload Photos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden transition-colors"
                    onClick={() => handlePhotoSelect(photo)}
                  >
                    <img
                      src={`${SERVER_BASE_URL}${photo.url}`}
                      alt={photo.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">
                        {photo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(photo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoSelector;
