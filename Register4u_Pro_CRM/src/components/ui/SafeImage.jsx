import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

const SafeImage = ({
  src,
  alt = "Image",
  className = "",
  fallbackSrc = null,
  placeholderClass = "bg-gray-100 flex items-center justify-center text-gray-400",
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    // Reset error when src changes
    setHasError(false);
    setImageSrc(src);
  }, [src]);

  const handleError = (e) => {
    if (onError) {
      onError(e);
    }
    setHasError(true);
  };

  if (!imageSrc || hasError) {
    if (fallbackSrc) {
      return (
        <img src={fallbackSrc} alt={alt} className={className} {...props} />
      );
    }
    // Render default placeholder
    return (
      <div className={`${className} ${placeholderClass}`}>
        <PhotoIcon className="h-1/2 w-1/2" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;
