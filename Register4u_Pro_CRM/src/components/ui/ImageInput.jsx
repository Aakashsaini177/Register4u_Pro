import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  CameraIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import CameraCapture from "@/components/ui/CameraCapture";
import ImageCropper from "@/components/ui/ImageCropper";
import { getImageUrl } from "@/lib/api";

const ImageInput = ({
  label,
  onChange,
  error,
  required = false,
  defaultPreview = null,
  aspectRatio = 3 / 4, // Default portrait for ID/Photo
}) => {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' or 'upload'
  const [preview, setPreview] = useState(getImageUrl(defaultPreview));
  const [showCamera, setShowCamera] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImage(url);
      setShowCropper(true);
      // Reset input so same file can be selected again if needed
      e.target.value = "";
    }
  };

  // Handle Camera Capture
  const handleCapture = (file, url) => {
    setTempImage(url);
    setShowCamera(false);
    setShowCropper(true);
  };

  // Handle Crop Complete
  const handleCrop = (croppedUrl) => {
    setPreview(croppedUrl);
    setShowCropper(false);

    // Convert blob URL to File object
    fetch(croppedUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "image.jpg", { type: "image/jpeg" });
        onChange(file, croppedUrl);
      });
  };

  const clearImage = () => {
    setPreview(null);
    setTempImage(null);
    onChange(null, null);
  };

  return (
    <div className="space-y-2">
      <Label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === "camera"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CameraIcon className="w-4 h-4" />
            Camera
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === "upload"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Upload
          </div>
        </button>
      </div>

      {/* Preview Area */}
      <div className="relative">
        <div
          className={`
            border-2 border-dashed rounded-lg overflow-hidden
            bg-gray-50 flex flex-col items-center justify-center
            transition-all duration-200
            w-24 h-24 mx-auto
            ${
              preview
                ? "border-solid border-gray-200"
                : "border-gray-300 hover:border-indigo-400"
            }
          `}
        >
          {preview ? (
            <div className="relative w-full h-full group">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-full object-cover"
                onError={() => setPreview(null)}
              />
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTempImage(preview);
                    setShowCropper(true);
                  }}
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <PencilIcon className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearImage}
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <XMarkIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-1">
              {activeTab === "camera" ? (
                <div
                  onClick={() => setShowCamera(true)}
                  className="cursor-pointer flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                    <CameraIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">
                    Capture
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 leading-tight">
                    Upload
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {/* Modals */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showCropper && (
        <ImageCropper
          imageSrc={tempImage}
          onCrop={handleCrop}
          onCancel={() => setShowCropper(false)}
          aspect={aspectRatio}
        />
      )}
    </div>
  );
};

export default ImageInput;
