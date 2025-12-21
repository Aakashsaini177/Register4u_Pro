import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { visitorAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { PrinterIcon, VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import QrScanner from "react-qr-scanner";

const PrintScanner = () => {
  const navigate = useNavigate();
  const [visitorId, setVisitorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const inputRef = useRef(null);

  // Auto-focus for gun scanner
  useEffect(() => {
    if (!isCameraOpen) {
      const focusInterval = setInterval(() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }, 1000);
      return () => clearInterval(focusInterval);
    }
  }, [isCameraOpen]);

  // Auto-submit when scanner input detected
  useEffect(() => {
    const timer = setTimeout(() => {
      if (visitorId.trim().length >= 3) {
        handleScan(visitorId);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [visitorId]);

  const handleScan = async (id) => {
    if (!id.trim() || loading) return;

    setLoading(true);
    try {
      const response = await visitorAPI.getAll({ search: id.trim() });

      if (response.data.success && response.data.data.length > 0) {
        const foundVisitor = response.data.data.find(
          (v) =>
            v.visitorId === id ||
            v.id === id ||
            v.visitorId?.toLowerCase() === id.toLowerCase()
        );

        if (foundVisitor) {
          toast.success(`Visitor Found: ${foundVisitor.name} - Redirecting to print...`);
          // Directly redirect to print page
          navigate(`/visitors/card/${foundVisitor._id || foundVisitor.id}`);
        } else {
          toast.error("Visitor not found");
        }
      } else {
        toast.error("Visitor not found");
      }
    } catch (error) {
      console.error("Scan Error:", error);
      toast.error("Error finding visitor");
    } finally {
      setLoading(false);
      setVisitorId("");
    }
  };

  const handleQrScan = (data) => {
    if (data && !loading) {
      // react-qr-scanner returns data in different formats
      const scannedText = typeof data === 'string' ? data : data.text || data;
      
      // Prevent duplicate scans
      if (scannedText === lastScannedCode) return;
      
      console.log("QR Code detected:", scannedText);
      setLastScannedCode(scannedText);
      toast.success(`QR Code detected: ${scannedText}`);
      setIsCameraOpen(false); // Stop camera after successful scan
      handleScan(scannedText);
      
      // Reset last scanned code after 2 seconds
      setTimeout(() => setLastScannedCode(""), 2000);
    }
  };

  const handleQrError = (err) => {
    // Only log actual errors, not permission requests
    if (err && err.name !== 'NotAllowedError') {
      console.error("QR Scanner Error:", err);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleScan(visitorId);
  };

  const toggleCamera = () => {
    setIsCameraOpen(!isCameraOpen);
    if (!isCameraOpen) {
      toast.success("Camera started - Point at QR code");
    } else {
      toast.success("Camera stopped");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <PrinterIcon className="h-10 w-10 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Print Kiosk
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Scan QR Code or Barcode to automatically print visitor ID card
        </p>
      </div>

      <Card className="border-2 border-primary-500 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <PrinterIcon className="h-6 w-6 text-primary-600" />
            Scanner Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Scanner Interface */}
          {/* Camera Toggle Button */}
          <div className="flex justify-center mb-6">
                <Button
                  type="button"
                  onClick={toggleCamera}
                  variant={isCameraOpen ? "destructive" : "default"}
                  className="w-full sm:w-auto"
                >
                  {isCameraOpen ? (
                    <>
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <VideoCameraIcon className="h-5 w-5 mr-2" />
                      Start QR Scanner
                    </>
                  )}
                </Button>
              </div>

              {/* QR Scanner */}
              {isCameraOpen && (
                <div className="bg-black rounded-lg overflow-hidden relative mb-6">
                  <QrScanner
                    delay={50}
                    onError={handleQrError}
                    onScan={handleQrScan}
                    style={{ width: "100%", height: "300px" }}
                    constraints={{
                      video: { 
                        facingMode: "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        frameRate: { ideal: 30, min: 15 }
                      }
                    }}
                    legacyMode={false}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    QR Scanner Active
                  </div>
                </div>
              )}

              {/* Input Field */}
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={isCameraOpen ? "QR Scanner active - or type here..." : "Scan here..."}
                    value={visitorId}
                    onChange={(e) => setVisitorId(e.target.value.toUpperCase())}
                    className="text-center text-2xl font-mono py-6 tracking-widest border-2 focus:ring-4 focus:ring-primary-200"
                    autoFocus={!isCameraOpen}
                    disabled={loading}
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loading size="sm" />
                    </div>
                  )}
                </div>

                <p className="text-center text-sm text-gray-500">
                  {loading ? "Searching..." : 
                   isCameraOpen ? "QR Scanner active - Point phone QR code at camera" :
                   "Use QR scanner, barcode gun, or type visitor ID"}
                </p>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <strong>Instructions:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Use <strong>QR Scanner</strong> for phone QR codes</li>
                    <li>Use handheld <strong>Barcode Scanner</strong> (cursor auto-focuses)</li>
                    <li>Visitor found → <strong>Print ID Card</strong> option appears</li>
                  </ul>
                </div>
              </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintScanner;
