import React, { useState, useEffect } from "react";
import {
  getImageUrl,
  getPhotoFromFileManager,
  UPLOADS_BASE_URL,
} from "@/lib/api";
import { UserIcon } from "@heroicons/react/24/outline";

/**
 * VisitorAvatar Component
 *
 * Displays a visitor's photo with robust fallback mechanisms.
 * 1. Tries to load the photo from backend (DB path).
 * 2. Tries common extensions in uploads folder.
 * 3. FALLBACK: Asynchronously checks File Manager for a file named "visitorId".
 * 4. Final Fallback: UserIcon.
 */
const VisitorAvatar = ({ photo, name, visitorId, className = "", alt = "Visitor" }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCheckingFileManager, setIsCheckingFileManager] = useState(false);

  useEffect(() => {
    if (photo) {
      setImgSrc(getImageUrl(photo));
      setHasError(false);
      setRetryCount(0);
      setIsCheckingFileManager(false);
    } else if (visitorId && !isCheckingFileManager) {
      // If no photo in DB, try File Manager with visitorId
      setIsCheckingFileManager(true);
      checkFileManagerForPhoto();
    } else {
      setImgSrc(null);
      setHasError(true);
    }
  }, [photo, visitorId]);

  const checkFileManagerForPhoto = async () => {
    try {
      const fileManagerUrl = await getPhotoFromFileManager(visitorId);
      if (fileManagerUrl) {
        setImgSrc(fileManagerUrl);
        setHasError(false);
        setRetryCount(0);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error("Error checking File Manager for photo:", error);
      setHasError(true);
    } finally {
      setIsCheckingFileManager(false);
    }
  };

  const handleError = async () => {
    // Basic extension fallback logic
    if (retryCount === 0 && imgSrc && imgSrc.includes(".jpg")) {
      // Try png
      setImgSrc(imgSrc.replace(".jpg", ".png"));
      setRetryCount(1);
    } else if (retryCount === 0 && imgSrc && imgSrc.includes(".png")) {
      // Try jpg
      setImgSrc(imgSrc.replace(".png", ".jpg"));
      setRetryCount(1);
    } else if (retryCount === 1 && visitorId && !isCheckingFileManager) {
      // If extension fallback failed and we have visitorId, try File Manager
      setIsCheckingFileManager(true);
      try {
        const fileManagerUrl = await getPhotoFromFileManager(visitorId);
        if (fileManagerUrl) {
          setImgSrc(fileManagerUrl);
          setRetryCount(2);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error checking File Manager for photo:", error);
        setHasError(true);
      } finally {
        setIsCheckingFileManager(false);
      }
    } else {
      setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400`}
      >
        {isCheckingFileManager ? (
          <div className="animate-spin rounded-full h-1/2 w-1/2 border-b-2 border-gray-400"></div>
        ) : (
          <UserIcon className="h-1/2 w-1/2" />
        )}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={name || alt}
      className={`${className} object-contain`}
      onError={handleError}
    />
  );
};

export default VisitorAvatar;
