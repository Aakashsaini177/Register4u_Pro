import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import {
  VideoCameraIcon,
  XMarkIcon,
  QrCodeIcon,
  BarsArrowDownIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const UniversalScanner = ({
  onScan,
  onError,
  placeholder = "Scan QR Code or Barcode...",
  className = "",
  autoFocus = true,
  showCameraButton = true,
  debounceMs = 300,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [inputMethod, setInputMethod] = useState("AUTO");
  const [lastInputTime, setLastInputTime] = useState(0);
  
  const inputRef = useRef(null);
  const inputTimeoutRef = useRef(null);

  // Simple Input Detection (Original)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length >= 3) {
        const now = Date.now();
        const timeDiff = now - lastInputTime;
        
        if (timeDiff < 100 && inputValue.length > 5) {
          setInputMethod("GUN");
          toast.success("🔫 Gun Scanner");
        } else if (timeDiff < 500 && inputValue.length > 3) {
          setInputMethod("SCANNER");
          toast.success("📱 Scanner");
        } else {
          setInputMethod("MANUAL");
        }
        
        handleScan(inputValue.trim());
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, lastInputTime]);

  // Auto-focus management
  useEffect(() => {
    if (autoFocus && !isCameraOpen) {
      const focusInterval = setInterval(() => {
        if (document.activeElement !== inputRef.current && inputMethod !== "CAMERA") {
          inputRef.current?.focus();
        }
      }, 1000);
      return () => clearInterval(focusInterval);
    }
  }, [autoFocus, isCameraOpen, inputMethod]);

  const detectFormat = (text) => {
    if (text.startsWith("http") || text.includes("://")) {
      return "QR_URL";
    } else if (text.includes("{") || text.includes("}")) {
      return "QR_JSON";
    } else if (/^[A-Z][0-9]{3,}$/.test(text)) {
      return "VISITOR_ID";
    } else if (/^\d{8,}$/.test(text)) {
      return "BARCODE_NUMERIC";
    } else if (/^[A-Z0-9\-]{6,}$/.test(text)) {
      return "BARCODE_ALPHANUMERIC";
    }
    return "UNKNOWN";
  };

  const handleScan = async (scannedText) => {
    if (!scannedText || loading) return;

    setLoading(true);
    const format = detectFormat(scannedText);

    try {
      toast.success(`✅ Scanned: ${scannedText.substring(0, 15)}...`);
      await onScan(scannedText, format);
      setInputValue("");
    } catch (error) {
      console.error("Scan error:", error);
      if (onError) {
        onError(error);
      } else {
        toast.error("❌ Scan failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    const now = Date.now();
    
    if (value.length > inputValue.length) {
      setLastInputTime(now);
    }
    
    setInputValue(value);
    
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    
    inputTimeoutRef.current = setTimeout(() => {
      if (value.length >= 6) {
        setInputMethod("GUN");
      }
    }, 50);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setInputMethod("MANUAL");
    handleScan(inputValue.trim());
  };

  const getInputMethodIcon = () => {
    switch (inputMethod) {
      case "GUN":
        return "🔫";
      case "SCANNER":
        return "📱";
      case "MANUAL":
        return "⌨️";
      case "CAMERA":
        return "📷";
      default:
        return "🤖";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Simple Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-center">
          <span className="font-medium text-blue-800 dark:text-blue-200">
            {inputMethod === "AUTO" ? "Ready to Scan" : `${inputMethod} Mode`}
          </span>
        </div>
      </div>

      {/* Simple Input Field */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            className="text-center text-lg font-mono py-4 tracking-wider border-2 focus:ring-4 focus:ring-primary-200"
            autoFocus={autoFocus}
            disabled={loading}
          />
          
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loading size="sm" />
            </div>
          )}

          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <span className="text-sm text-gray-400">{getInputMethodIcon()}</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          {loading ? "Processing..." : "Ready for scanning"}
        </p>
      </form>

      {/* Simple Info */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-center">
        <p className="text-gray-600 dark:text-gray-400">
          QR Codes • Barcodes • Visitor IDs
        </p>
      </div>
    </div>
  );
};

export default UniversalScanner;

  // Smart Input Detection - Faster
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length >= 2) { // Reduced from 3 to 2
        const now = Date.now();
        const timeDiff = now - lastInputTime;
        
        // Detect input method based on typing speed and pattern
        if (timeDiff < 50 && inputValue.length > 4) { // Faster detection
          setInputMethod("GUN");
          toast.success("🔫 Gun Scanner");
        } else if (timeDiff < 200 && inputValue.length > 2) { // Faster
          setInputMethod("SCANNER");
          toast.success("📱 Scanner");
        } else {
          setInputMethod("MANUAL");
        }
        
        handleScan(inputValue.trim());
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, lastInputTime]);

  // Auto-focus management with smart detection
  useEffect(() => {
    if (autoFocus && !isCameraOpen) {
      const focusInterval = setInterval(() => {
        if (document.activeElement !== inputRef.current && inputMethod !== "CAMERA") {
          inputRef.current?.focus();
        }
      }, 1000); // More frequent focus for gun scanners
      return () => clearInterval(focusInterval);
    }
  }, [autoFocus, isCameraOpen, inputMethod]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ULTRA-SMART: Estimate scan distance based on code size
  const estimateDistance = (result) => {
    try {
      const points = result.getResultPoints();
      if (points && points.length >= 2) {
        const distance = Math.sqrt(
          Math.pow(points[1].getX() - points[0].getX(), 2) + 
          Math.pow(points[1].getY() - points[0].getY(), 2)
        );
        
        if (distance > 200) return "Close (<50cm)";
        else if (distance > 100) return "Medium (50cm-1m)";
        else if (distance > 50) return "Far (1-2m)";
        else return "Very Far (>2m)";
      }
    } catch (e) {
      console.warn("Distance estimation failed:", e);
    }
    return "Unknown";
  };

  const detectFormat = (text) => {
    // Enhanced format detection for QR codes and barcodes
    if (text.startsWith("http") || text.includes("://") || text.includes("www.")) {
      return "QR_URL";
    } else if (text.includes("{") || text.includes("}") || text.includes("[") || text.includes("]")) {
      return "QR_JSON";
    } else if (text.includes("BEGIN:VCARD") || text.includes("MECARD:")) {
      return "QR_VCARD";
    } else if (text.includes("WIFI:") || text.includes("wifi:")) {
      return "QR_WIFI";
    } else if (/^[A-Z][0-9]{3,}$/.test(text)) {
      return "VISITOR_ID";
    } else if (/^\d{8,}$/.test(text)) {
      return "BARCODE_NUMERIC";
    } else if (/^[A-Z0-9\-]{6,}$/.test(text)) {
      return "BARCODE_ALPHANUMERIC";
    } else if (/^[0-9]{12,13}$/.test(text)) {
      return "EAN_UPC";
    } else if (text.length > 20) {
      return "QR_TEXT"; // Long text is likely QR
    }
    return "UNKNOWN";
  };

  const handleScan = async (scannedText) => {
    if (!scannedText || loading) return;

    setLoading(true);
    const format = detectFormat(scannedText);
    setDetectedFormat(format);

    try {
      // Increment scan count
      setScanCount(prev => prev + 1);
      
      // Quick success feedback with format detection
      const formatEmojis = {
        QR_URL: "🔗",
        QR_JSON: "📄", 
        QR_VCARD: "👤",
        QR_WIFI: "📶",
        QR_TEXT: "📝",
        VISITOR_ID: "🎫",
        BARCODE_NUMERIC: "📊",
        BARCODE_ALPHANUMERIC: "🏷️",
        EAN_UPC: "🛒",
        UNKNOWN: "❓"
      };
      
      const emoji = formatEmojis[format] || "✅";
      toast.success(`${emoji} Scan #${scanCount + 1}: ${scannedText.substring(0, 12)}...`);
      
      await onScan(scannedText, format);
      setInputValue(""); // Clear input after successful scan
      
      // Camera stays on for continuous scanning (Gate Mode)
      if (isCameraOpen) {
        // Enable continuous mode after first camera scan
        if (!continuousMode) {
          setContinuousMode(true);
          toast.success("🚪 Gate Mode: Camera stays on for continuous scanning");
        }
        
        // Quick audio feedback
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.play().catch(() => {});
        } catch (e) {}
        
        // Show ready for next scan message
        setTimeout(() => {
          toast.success("🔄 Ready for next scan!");
        }, 1000);
      }
    } catch (error) {
      console.error("Scan error:", error);
      if (onError) {
        onError(error);
      } else {
        toast.error("❌ Scan failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    const now = Date.now();
    
    // Track input timing for method detection
    if (value.length > inputValue.length) {
      setLastInputTime(now);
    }
    
    setInputValue(value);
    
    // Clear any existing timeout
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    
    // Set new timeout for gun scanner detection - Faster
    inputTimeoutRef.current = setTimeout(() => {
      if (value.length >= 4) { // Reduced from 6 to 4
        setInputMethod("GUN");
      }
    }, 25); // Reduced from 50 to 25ms
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setInputMethod("MANUAL");
    handleScan(inputValue.trim());
  };

  const startCamera = async () => {
    if (!codeReaderRef.current) {
      toast.error("❌ Scanner not initialized");
      return;
    }

    try {
      setScanError(null);
      setIsScanning(true);
      setInputMethod("CAMERA");
      setSmartMode(true);

      console.log("🎯 Starting ULTRA-SMART camera...");

      // Get available cameras
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found");
      }

      console.log("📷 Available cameras:", videoInputDevices.length);

      // Select best camera
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      )?.deviceId || videoInputDevices[0].deviceId;

      console.log("📷 Selected camera:", selectedDeviceId);

      // Start scanning with simple configuration
      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log("✅ Camera scan success:", scannedText);
            
            // Estimate distance (simple version)
            const points = result.getResultPoints();
            let distance = "Unknown";
            if (points && points.length >= 2) {
              const dist = Math.sqrt(
                Math.pow(points[1].getX() - points[0].getX(), 2) + 
                Math.pow(points[1].getY() - points[0].getY(), 2)
              );
              if (dist > 150) distance = "Close";
              else if (dist > 75) distance = "Medium";
              else distance = "Far";
            }
            
            setScanDistance(distance);
            setInputMethod("CAMERA");
            handleScan(scannedText);
            
          } else if (error && !(error instanceof NotFoundException)) {
            console.warn("Scan attempt:", error.message);
          }
        }
      );

      setIsCameraOpen(true);
      setIsScanning(false);
      toast.success("🎯 ULTRA-SMART Camera Ready!");
      
    } catch (error) {
      console.error("❌ Camera error:", error);
      setScanError(`Camera error: ${error.message}`);
      setIsScanning(false);
      setInputMethod("AUTO");
      setSmartMode(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error("❌ Camera permission denied");
      } else if (error.name === 'NotFoundError') {
        toast.error("❌ No camera found");
      } else {
        toast.error(`❌ Camera failed: ${error.message}`);
      }
      
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  };

  const stopCamera = () => {
    try {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      setIsCameraOpen(false);
      setScanError(null);
      setIsScanning(false);
      setInputMethod("AUTO");
      setContinuousMode(false); // Reset continuous mode
      setScanCount(0); // Reset scan count
      setSmartMode(false); // Reset ultra-smart mode
      setScanDistance("Unknown"); // Reset distance
      toast.success("🎯 ULTRA-SMART Scanner stopped");
      
      // Auto-focus on input after stopping camera
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  const toggleCamera = () => {
    if (isCameraOpen) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const getFormatIcon = () => {
    switch (detectedFormat) {
      case "QR_URL":
      case "QR_JSON":
      case "QR_VCARD":
      case "QR_WIFI":
      case "QR_TEXT":
        return <QrCodeIcon className="h-4 w-4 text-blue-500" />;
      case "BARCODE_NUMERIC":
      case "BARCODE_ALPHANUMERIC":
      case "EAN_UPC":
        return <BarsArrowDownIcon className="h-4 w-4 text-green-500" />;
      case "VISITOR_ID":
        return <QrCodeIcon className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getInputMethodIcon = () => {
    switch (inputMethod) {
      case "GUN":
        return "🔫";
      case "SCANNER":
        return "📱";
      case "MANUAL":
        return "⌨️";
      case "CAMERA":
        return "📷";
      default:
        return "🤖";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ULTRA-SMART Detection Status with Distance */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-purple-800 dark:text-purple-200">
              {smartMode ? "🎯 ULTRA-SMART" : (inputMethod === "AUTO" ? "Ready to Scan" : `${inputMethod} Mode`)}
            </span>
            {scanDistance !== "Unknown" && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                📏 {scanDistance}
              </span>
            )}
          </div>
          {continuousMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                🚪 Gate Mode
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Scans: {scanCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Camera Toggle Button */}
      {showCameraButton && (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={toggleCamera}
            variant={isCameraOpen ? "destructive" : "default"}
            className="w-full sm:w-auto"
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Loading size="sm" className="mr-2" />
                Starting Camera...
              </>
            ) : isCameraOpen ? (
              <>
                <XMarkIcon className="h-5 w-5 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                {smartMode ? "🎯 Start ULTRA-SMART Scanner" : "Start Camera Scanner"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Camera View - Simplified */}
      {isCameraOpen && (
        <div className="bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover"
            playsInline
            muted
            autoPlay
            onLoadedMetadata={() => {
              console.log("📷 Video loaded successfully");
            }}
            onError={(e) => {
              console.error("❌ Video error:", e);
              setScanError("Video playback failed");
            }}
          />
          
          {/* Simple Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-green-400 border-solid w-64 h-64 rounded-lg flex items-center justify-center animate-pulse">
              <div className="text-white text-center bg-black/90 p-4 rounded-lg">
                <QrCodeIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-bold">
                  🎯 SCANNING
                </p>
                <p className="text-sm">
                  {continuousMode ? `Scan #${scanCount + 1}` : "Point at QR/Barcode"}
                </p>
                <p className="text-xs mt-1 text-green-200">
                  Works from distance!
                </p>
              </div>
            </div>
          </div>

          {/* Success Indicator */}
          {loading && inputMethod === "CAMERA" && (
            <div className="absolute top-4 left-4 right-4 bg-green-500 text-white p-3 text-center text-sm rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <span>✅ Code Detected!</span>
                {scanDistance !== "Unknown" && (
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">
                    📏 {scanDistance}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {scanError && (
            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-sm">
              {scanError}
              <button 
                onClick={() => setScanError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          )}

          {/* Status Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs">
            <div className="flex justify-between items-center">
              <span>📷 Camera: {isCameraOpen ? 'Active' : 'Inactive'}</span>
              <span>📏 Distance: {scanDistance}</span>
              <span>🔢 Scans: {scanCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Smart Input Field - Always Available */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={isCameraOpen ? "Camera active - or type here..." : placeholder}
            value={inputValue}
            onChange={handleInputChange}
            className="text-center text-lg font-mono py-4 tracking-wider border-2 focus:ring-4 focus:ring-primary-200"
            autoFocus={autoFocus && !isCameraOpen}
            disabled={loading}
          />
          
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loading size="sm" />
            </div>
          )}

          {/* Input Method Indicator - Simplified */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <span className="text-sm text-gray-400">{getInputMethodIcon()}</span>
          </div>
        </div>

        {/* ULTRA-SMART Status Text */}
        <p className="text-center text-sm text-gray-500">
          {loading ? "🎯 ULTRA-SMART Processing..." : 
           isCameraOpen ? (continuousMode ? "🚪 Gate Mode: Scan from 1-2 meters distance" : "🎯 ULTRA-SMART: Long range detection active") :
           "Ready for ultra-smart scanning"}
        </p>
        
        {/* Gate Mode Info */}
        {isCameraOpen && continuousMode && (
          <div className="bg-gradient-to-r from-green-50 to-purple-50 p-3 rounded-lg text-xs text-center border border-green-200">
            <p className="text-green-800 font-semibold">
              🚪 ULTRA-SMART GATE MODE: Scan from any distance (1-2 meters)
            </p>
            <p className="text-green-600 text-xs mt-1">
              Total scans: {scanCount} | Distance: {scanDistance} | Click "Stop Camera" when done
            </p>
          </div>
        )}
        
        {/* ULTRA-SMART Tips */}
        {isCameraOpen && !continuousMode && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg text-xs text-center border border-purple-200">
            <p className="text-purple-800 font-semibold">
              🎯 ULTRA-SMART MODE: Long Range Detection (1-2 meters)
            </p>
            <p className="text-purple-600 text-xs mt-1">
              No need to get close! Works with QR codes, barcodes, visitor IDs from distance
            </p>
          </div>
        )}
      </form>

      {/* Essential Info - ULTRA-SMART */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-800 p-4 rounded-lg text-sm text-center border border-purple-200">
        <p className="text-gray-600 dark:text-gray-400 font-semibold">
          🎯 ULTRA-SMART Scanner: Long Range Detection
        </p>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          QR Codes • Barcodes • Visitor IDs • Works from 1-2 meters distance
        </p>
        
        {/* Test Button for Debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleScan("TEST123")}
              className="text-xs"
            >
              🧪 Test ULTRA-SMART
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalScanner;