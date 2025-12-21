import React, { useState, useEffect, useRef } from "react";
import PortalLayout from "./PortalLayout";
import { portalDashboardAPI } from "@/lib/portalApi";
import { getImageUrl } from "@/lib/api";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import toast from "react-hot-toast";

const PortalHotelScan = () => {
  const [visitorId, setVisitorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const [codeReader, setCodeReader] = useState(null);

  // Initialize ZXing code reader (Reused logic from Admin/Scanner)
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
    ]);
    reader.hints = hints;
    setCodeReader(reader);

    return () => {
      if (reader) reader.reset();
    };
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!visitorId.trim()) return;

    setLoading(true);
    setScanResult(null);

    try {
      const response = await portalDashboardAPI.scanVisitor(visitorId);
      if (response.data.success) {
        setScanResult(response.data.data);
        toast.success(`Visitor found: ${response.data.data.name}`);
        setVisitorId(""); // Clear input on success
      } else {
        toast.error("Visitor not found or access denied.");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(error.response?.data?.message || "Error scanning visitor");
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return;
    try {
      await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            toast.success(`Scanned: ${text}`);
            setVisitorId(text);
            setIsCameraOpen(false);
            codeReader.reset();

            // Auto-submit logic would be nice here, but state update is async.
            // We'll just set it and let user click or trigger search manually?
            // Better: Trigger search with the scanned text directly.
            // NOTE: Cannot call handleSearch directly without event, so refactor logic.

            // Actually, let's just perform the API call directly here:
            performDirectScan(text);
          }
        }
      );
    } catch (err) {
      console.error("Camera error", err);
      toast.error("Failed to start camera");
      setIsCameraOpen(false);
    }
  };

  const performDirectScan = async (id) => {
    setLoading(true);
    try {
      const response = await portalDashboardAPI.scanVisitor(id);
      if (response.data.success) {
        setScanResult(response.data.data);
        toast.success(`Visitor found: ${response.data.data.name}`);
      }
    } catch (error) {
      toast.error("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    if (isCameraOpen) {
      codeReader.reset();
      setIsCameraOpen(false);
    } else {
      setIsCameraOpen(true);
      setTimeout(startScanning, 100);
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scan Visitor
          </h2>
          <p className="text-gray-500">
            Scan QR/Barcode or enter Visitor ID to verify guest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Scanner/Input */}
          <Card>
            <CardHeader>
              <CardTitle>Scanner Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={toggleCamera}
                  variant={isCameraOpen ? "destructive" : "default"}
                  className="w-full sm:w-auto"
                >
                  {isCameraOpen ? (
                    <>
                      <XMarkIcon className="h-5 w-5 mr-2" /> Stop Camera
                    </>
                  ) : (
                    <>
                      <VideoCameraIcon className="h-5 w-5 mr-2" /> Start Scanner
                    </>
                  )}
                </Button>
              </div>

              {isCameraOpen && (
                <div className="bg-black rounded-lg overflow-hidden relative h-64">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Active
                  </div>
                </div>
              )}

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="vid" className="sr-only">
                    Visitor ID
                  </Label>
                  <Input
                    id="vid"
                    placeholder="Enter Visitor ID..."
                    value={visitorId}
                    onChange={(e) => setVisitorId(e.target.value.toUpperCase())}
                    className="text-lg font-mono uppercase"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loading size="sm" />
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right: Result */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Result</CardTitle>
            </CardHeader>
            <CardContent>
              {scanResult ? (
                <div className="text-center space-y-4 animate-fade-in-up">
                  <div className="flex flex-col items-center">
                    {/* Photo Display */}
                    <div className="mb-4 h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-gray-100">
                      <VisitorAvatar
                        photo={scanResult.photo}
                        name={scanResult.name}
                        visitorId={scanResult.visitorId}
                        className="w-full h-full text-2xl"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {scanResult.name}
                      </h3>
                      <p className="text-gray-500">{scanResult.visitorId}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Event:</span>
                      <span className="font-medium">
                        {scanResult.eventName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Contact:</span>
                      <span className="font-medium">{scanResult.contact}</span>
                    </div>
                    {/* Add Hotel Check-In Logic here if needed */}
                    {scanResult.roomNumber && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Assigned Room:</span>
                        <span className="font-medium text-blue-600">
                          {scanResult.roomNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {/* Only show 'Check In' if hotel portal and not checked in? */}
                  {/* For now just view only */}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                  <p>No result to display</p>
                  <p className="text-sm">Scan a visitor to see details here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalHotelScan;
