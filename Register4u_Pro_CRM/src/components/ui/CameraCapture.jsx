import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError(
        "Unable to access camera. Please ensure you have granted permissions."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Check if video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video not ready yet");
        return;
      }

      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob/file
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas to Blob failed");
            return;
          }
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          onCapture(file, URL.createObjectURL(blob));
          stopCamera();
        },
        "image/jpeg",
        0.95
      );
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Take Photo</h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 bg-black flex justify-center items-center relative min-h-[300px]">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-h-[60vh] max-w-full rounded-md"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 flex justify-center gap-4 bg-gray-50 dark:bg-gray-900">
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={capturePhoto} className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            Capture
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
