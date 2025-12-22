import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ImageCropper = ({
  imageSrc,
  onCrop,
  onCancel,
  aspect = 3 / 4,
  freeAspect = false,
  title = "Adjust Photo",
}) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200 * (freeAspect ? 1 : 1 / aspect),
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    cropArea: null,
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);

      // Center crop area initially
      const containerWidth = 400;
      const containerHeight = 500;
      const cropWidth = Math.min(200, containerWidth * 0.6);
      const cropHeight = freeAspect ? cropWidth : cropWidth / aspect;

      setCropArea({
        x: (containerWidth - cropWidth) / 2,
        y: (containerHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
    };
    img.src = imageSrc;
  }, [imageSrc, aspect]);

  const handleMouseDown = (e, action, direction = null) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (action === "drag") {
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      setIsDragging(true);
    } else if (action === "resize") {
      setResizeStart({
        x: x,
        y: y,
        cropArea: { ...cropArea },
      });
      setResizeDirection(direction);
      setIsResizing(true);
    }
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle double click to reset crop area to center
  const handleDoubleClick = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 - cropArea.width / 2;
    const centerY = rect.height / 2 - cropArea.height / 2;

    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(rect.width - prev.width, centerX)),
      y: Math.max(0, Math.min(rect.height - prev.height, centerY)),
    }));
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(rect.width - cropArea.width, x - dragStart.x)
      );
      const newY = Math.max(
        0,
        Math.min(rect.height - cropArea.height, y - dragStart.y)
      );

      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing && resizeDirection) {
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      const startCrop = resizeStart.cropArea;

      let newCrop = { ...startCrop };

      // Handle different resize directions
      switch (resizeDirection) {
        case "se": // Bottom-right corner
          if (freeAspect) {
            newCrop.width = Math.max(50, startCrop.width + deltaX);
            newCrop.height = Math.max(50, startCrop.height + deltaY);
          } else {
            newCrop.width = Math.max(50, startCrop.width + deltaX);
            newCrop.height = newCrop.width / aspect;
          }
          break;

        case "nw": // Top-left corner
          if (freeAspect) {
            const newWidth = Math.max(50, startCrop.width - deltaX);
            const newHeight = Math.max(50, startCrop.height - deltaY);
            newCrop.x = startCrop.x + startCrop.width - newWidth;
            newCrop.y = startCrop.y + startCrop.height - newHeight;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          } else {
            const newWidth = Math.max(50, startCrop.width - deltaX);
            const newHeight = newWidth / aspect;
            newCrop.x = startCrop.x + startCrop.width - newWidth;
            newCrop.y = startCrop.y + startCrop.height - newHeight;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          }
          break;

        case "ne": // Top-right corner
          if (freeAspect) {
            const newWidth = Math.max(50, startCrop.width + deltaX);
            const newHeight = Math.max(50, startCrop.height - deltaY);
            newCrop.y = startCrop.y + startCrop.height - newHeight;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          } else {
            const newWidth = Math.max(50, startCrop.width + deltaX);
            const newHeight = newWidth / aspect;
            newCrop.y = startCrop.y + startCrop.height - newHeight;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          }
          break;

        case "sw": // Bottom-left corner
          if (freeAspect) {
            const newWidth = Math.max(50, startCrop.width - deltaX);
            const newHeight = Math.max(50, startCrop.height + deltaY);
            newCrop.x = startCrop.x + startCrop.width - newWidth;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          } else {
            const newWidth = Math.max(50, startCrop.width - deltaX);
            const newHeight = newWidth / aspect;
            newCrop.x = startCrop.x + startCrop.width - newWidth;
            newCrop.width = newWidth;
            newCrop.height = newHeight;
          }
          break;

        case "e": // Right edge
          newCrop.width = Math.max(50, startCrop.width + deltaX);
          if (!freeAspect) {
            newCrop.height = newCrop.width / aspect;
          }
          break;

        case "w": // Left edge
          const newWidth = Math.max(50, startCrop.width - deltaX);
          newCrop.x = startCrop.x + startCrop.width - newWidth;
          newCrop.width = newWidth;
          if (!freeAspect) {
            newCrop.height = newCrop.width / aspect;
          }
          break;

        case "s": // Bottom edge
          if (freeAspect) {
            newCrop.height = Math.max(50, startCrop.height + deltaY);
          } else {
            newCrop.height = Math.max(50, startCrop.height + deltaY);
            newCrop.width = newCrop.height * aspect;
          }
          break;

        case "n": // Top edge
          if (freeAspect) {
            const newHeight = Math.max(50, startCrop.height - deltaY);
            newCrop.y = startCrop.y + startCrop.height - newHeight;
            newCrop.height = newHeight;
          } else {
            const newHeight = Math.max(50, startCrop.height - deltaY);
            newCrop.y = startCrop.y + startCrop.height - newHeight;
            newCrop.height = newHeight;
            newCrop.width = newCrop.height * aspect;
          }
          break;
      }

      // Ensure crop area stays within container bounds
      newCrop.x = Math.max(0, Math.min(rect.width - newCrop.width, newCrop.x));
      newCrop.y = Math.max(
        0,
        Math.min(rect.height - newCrop.height, newCrop.y)
      );
      newCrop.width = Math.min(newCrop.width, rect.width - newCrop.x);
      newCrop.height = Math.min(newCrop.height, rect.height - newCrop.y);

      setCropArea(newCrop);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    cropArea,
    dragStart,
    resizeStart,
    resizeDirection,
    aspect,
    freeAspect,
  ]);

  const showCroppedImage = useCallback(async () => {
    if (!imageLoaded) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate scale factors
        const containerRect = containerRef.current.getBoundingClientRect();
        const displayWidth = containerRect.width;
        const displayHeight = containerRect.height;

        const scaleX = (imageSize.width * zoom) / displayWidth;
        const scaleY = (imageSize.height * zoom) / displayHeight;

        // Determine output size based on document type
        let outputWidth, outputHeight;

        if (title.includes("Driver Photo") || title.includes("Passport")) {
          // Passport size: 600x800 pixels (3:4 ratio, high quality)
          outputWidth = 600;
          outputHeight = 800;
        } else {
          // For documents, maintain original crop size but ensure minimum quality
          const originalWidth = cropArea.width * scaleX;
          const originalHeight = cropArea.height * scaleY;

          // Ensure minimum 800px on the longer side for document quality
          const minSize = 800;
          if (originalWidth > originalHeight) {
            if (originalWidth < minSize) {
              const ratio = minSize / originalWidth;
              outputWidth = minSize;
              outputHeight = originalHeight * ratio;
            } else {
              outputWidth = originalWidth;
              outputHeight = originalHeight;
            }
          } else {
            if (originalHeight < minSize) {
              const ratio = minSize / originalHeight;
              outputHeight = minSize;
              outputWidth = originalWidth * ratio;
            } else {
              outputWidth = originalWidth;
              outputHeight = originalHeight;
            }
          }
        }

        // Set canvas size to output size
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Draw cropped portion scaled to output size
        ctx.drawImage(
          img,
          cropArea.x * scaleX,
          cropArea.y * scaleY,
          cropArea.width * scaleX,
          cropArea.height * scaleY,
          0,
          0,
          outputWidth,
          outputHeight
        );

        // Use higher quality for passport photos
        const quality = title.includes("Driver Photo") ? 0.95 : 0.9;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              onCrop(url);
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.src = imageSrc;
    } catch (e) {
      console.error("Crop failed:", e);
    }
  }, [imageSrc, cropArea, zoom, imageSize, imageLoaded, onCrop, title]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-lg overflow-hidden flex flex-col max-h-[98vh] min-h-[500px]">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-900 z-10 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {title}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Cropping Area */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-black overflow-hidden cursor-crosshair"
          style={{ minHeight: "300px", maxHeight: "60vh" }}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          {imageLoaded && (
            <>
              {/* Background Image */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              />

              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"
                style={{
                  clipPath: `polygon(0% 0%, 0% 100%, ${cropArea.x}px 100%, ${
                    cropArea.x
                  }px ${cropArea.y}px, ${cropArea.x + cropArea.width}px ${
                    cropArea.y
                  }px, ${cropArea.x + cropArea.width}px ${
                    cropArea.y + cropArea.height
                  }px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${
                    cropArea.x
                  }px 100%, 100% 100%, 100% 0%)`,
                }}
              />

              {/* Crop Area */}
              <div
                className="absolute border-2 border-blue-400 cursor-move hover:border-blue-300 transition-colors"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.3), 0 0 10px rgba(59, 130, 246, 0.3)",
                }}
                onMouseDown={(e) => handleMouseDown(e, "drag")}
              >
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 w-px h-full bg-white bg-opacity-40"></div>
                  <div className="absolute left-2/3 top-0 w-px h-full bg-white bg-opacity-40"></div>
                  <div className="absolute top-1/3 left-0 h-px w-full bg-white bg-opacity-40"></div>
                  <div className="absolute top-2/3 left-0 h-px w-full bg-white bg-opacity-40"></div>
                </div>

                {/* Corner Resize Handles */}
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 cursor-se-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, "resize", "se");
                  }}
                />

                {freeAspect && (
                  <>
                    {/* Additional corner handles for free aspect */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 cursor-nw-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "resize", "nw");
                      }}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 cursor-ne-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "resize", "ne");
                      }}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 cursor-sw-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "resize", "sw");
                      }}
                    />
                  </>
                )}

                {/* Edge Resize Handles */}
                <div
                  className="absolute -right-1 top-1/2 w-2 h-6 bg-blue-400 cursor-e-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                  style={{ transform: "translateY(-50%)" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, "resize", "e");
                  }}
                />
                <div
                  className="absolute -bottom-1 left-1/2 w-6 h-2 bg-blue-400 cursor-s-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                  style={{ transform: "translateX(-50%)" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, "resize", "s");
                  }}
                />

                {freeAspect && (
                  <>
                    {/* Additional edge handles for free aspect */}
                    <div
                      className="absolute -left-1 top-1/2 w-2 h-6 bg-blue-400 cursor-w-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                      style={{ transform: "translateY(-50%)" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "resize", "w");
                      }}
                    />
                    <div
                      className="absolute -top-1 left-1/2 w-6 h-2 bg-blue-400 cursor-n-resize hover:bg-blue-300 transition-colors rounded-sm border border-white"
                      style={{ transform: "translateX(-50%)" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "resize", "n");
                      }}
                    />
                  </>
                )}

                {/* Center Indicator */}
                <div
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full pointer-events-none"
                  style={{ transform: "translate(-50%, -50%)" }}
                />
              </div>
            </>
          )}

          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Loading image...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-900 space-y-4 z-10 flex-shrink-0">
          {/* Instructions */}
          <div className="text-xs text-gray-400 text-center bg-gray-800 p-2 rounded-lg">
            <div className="font-medium text-white mb-2">Mouse Controls</div>
            <div>
              🖱️ <strong>Drag</strong> blue box to move crop area
            </div>
            <div>
              📐 <strong>Drag corners/edges</strong> to resize
            </div>
            <div>
              🔍 <strong>Mouse wheel</strong> to zoom image
            </div>
            <div>
              🎯 <strong>Double click</strong> to center crop area
            </div>
            {!freeAspect && (
              <div className="text-blue-400 mt-1">
                🔒 <strong>Fixed aspect ratio:</strong> {aspect.toFixed(2)}:1
              </div>
            )}
            {freeAspect && (
              <div className="text-green-400 mt-1">
                🆓 <strong>Free cropping:</strong> Any size/shape
              </div>
            )}
            <div className="text-gray-500 mt-2">
              Zoom: {zoom.toFixed(1)}x • Crop: {Math.round(cropArea.width)}×
              {Math.round(cropArea.height)}
              {!freeAspect &&
                ` • Ratio: ${(cropArea.width / cropArea.height).toFixed(2)}:1`}
            </div>
            {(title.includes("Driver Photo") || title.includes("Passport")) && (
              <div className="text-blue-400 mt-1 text-xs">
                📐 <strong>Output:</strong> 600×800px (Passport Size)
              </div>
            )}
            {title.includes("Free Cropping") && (
              <div className="text-green-400 mt-1 text-xs">
                📐 <strong>Output:</strong> High Quality (min 800px on longer
                side)
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 mt-3">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              className="flex-1 bg-transparent text-white border-gray-600 hover:bg-gray-700 py-2"
            >
              Retake
            </Button>
            <Button
              type="button"
              onClick={showCroppedImage}
              disabled={!imageLoaded}
              className="flex-1 flex items-center justify-center gap-2 py-2"
            >
              <CheckIcon className="h-4 w-4" />
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
