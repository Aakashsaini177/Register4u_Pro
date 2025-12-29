import React, { useState, useEffect, useRef } from "react";
import { visitorAPI, getImageUrl, authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import {
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TicketIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeModernIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Scanner = () => {
  const { token } = useAuthStore();
  const [visitorId, setVisitorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [codeReader, setCodeReader] = useState(null);
  const [fileManagerPhotos, setFileManagerPhotos] = useState({}); // Add file manager photos
  const videoRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize ZXing code reader
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    // Enable all barcode formats
    const hints = new Map();

    // Enable multiple barcode formats
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODABAR,
      BarcodeFormat.ITF,
      BarcodeFormat.RSS_14,
      BarcodeFormat.RSS_EXPANDED,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417,
    ]);

    // Try harder to find barcodes
    hints.set(DecodeHintType.TRY_HARDER, true);

    reader.hints = hints;
    setCodeReader(reader);

    // Fetch file manager photos on component mount
    fetchFileManagerPhotos();

    return () => {
      if (reader) {
        reader.reset();
      }
    };
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [codeReader]);

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
        performSearch(visitorId);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [visitorId]);

  const performSearch = async (id) => {
    if (!id.trim()) return;

    setLoading(true);

    try {
      // Use the new Scan API which logs the activity
      const response = await visitorAPI.scan(id);

      if (response.data.success) {
        const foundVisitor = response.data.data;
        setVisitor(foundVisitor);
        toast.success(`Visitor found: ${foundVisitor.name}`);
        setVisitorId("");
      } else {
        toast.error("Visitor not found");
      }
    } catch (error) {
      console.error("Scanner Error:", error);
      // Handle 404 specifically
      if (error.response && error.response.status === 404) {
        toast.error("Visitor not found");
      } else {
        toast.error("Error scanning visitor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(visitorId);
  };

  const handleClear = () => {
    setVisitorId("");
    setVisitor(null);
  };

  const fetchFileManagerPhotos = async () => {
    try {
      console.log("📸 [Scanner] Fetching file manager photos...");

      // Use the fileManagerAPI to get photos from photo folder
      const { fileManagerAPI } = await import("@/lib/fileManagerAPI");
      const photosResponse = await fileManagerAPI.getPhotosFromPhotoFolder();

      console.log("📸 [Scanner] Photos response:", photosResponse);

      if (photosResponse.data.success) {
        const photos = photosResponse.data.data;
        const photoMap = {};

        photos.forEach((photo) => {
          // Map by filename without extension and with extension
          const nameWithoutExt = photo.name.replace(/\.[^/.]+$/, "");
          photoMap[photo.name] = photo.url;
          photoMap[nameWithoutExt] = photo.url;

          console.log(`📸 [Scanner] Mapped photo: ${photo.name} -> ${photo.url}`);
        });

        setFileManagerPhotos(photoMap);
        console.log(
          `📸 [Scanner] Total photos mapped: ${Object.keys(photoMap).length / 2}`,
          photoMap
        );
      } else {
        console.log("📸 [Scanner] No photos found in file manager photo folder");
      }
    } catch (error) {
      console.error("❌ [Scanner] Failed to fetch file manager photos:", error);
      // Set empty object to prevent repeated failed attempts
      setFileManagerPhotos({});
    }
  };

  const handleQrScan = (data) => {
    if (data && !loading) {
      // react-qr-scanner returns data in different formats
      const scannedText = typeof data === "string" ? data : data.text || data;

      // Prevent duplicate scans
      if (scannedText === lastScannedCode) return;

      console.log("QR Code detected:", scannedText);
      setLastScannedCode(scannedText);
      toast.success(`QR Code detected: ${scannedText}`);
      setIsCameraOpen(false); // Stop camera after successful scan
      performSearch(scannedText);

      // Reset last scanned code after 2 seconds
      setTimeout(() => setLastScannedCode(""), 2000);
    }
  };

  const handleQrError = (err) => {
    // Only log actual errors, not permission requests
    if (err && err.name !== "NotAllowedError") {
      console.error("QR Scanner Error:", err);
    }
  };

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      // Get video input devices using navigator.mediaDevices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const selectedDeviceId = videoDevices[0]?.deviceId;

      // Configure video constraints for better barcode detection
      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: "environment",
          focusMode: "continuous",
          exposureMode: "continuous",
          whiteBalanceMode: "continuous",
        },
      };

      if (selectedDeviceId) {
        await codeReader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result, err) => {
            if (result) {
              const scannedText = result.getText();
              const format = result.getBarcodeFormat();

              // Prevent duplicate scans
              if (scannedText === lastScannedCode) return;

              console.log("Code detected:", scannedText, "Format:", format);
              setLastScannedCode(scannedText);
              toast.success(`${format} detected: ${scannedText}`);
              stopScanning();
              performSearch(scannedText);

              // Reset last scanned code after 2 seconds
              setTimeout(() => setLastScannedCode(""), 2000);
            }

            if (err && !(err.name === "NotFoundException")) {
              console.error("Scanner Error:", err);
            }
          }
        );
      } else {
        // Fallback: use default camera
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              const scannedText = result.getText();
              const format = result.getBarcodeFormat();

              // Prevent duplicate scans
              if (scannedText === lastScannedCode) return;

              console.log("Code detected:", scannedText, "Format:", format);
              setLastScannedCode(scannedText);
              toast.success(`${format} detected: ${scannedText}`);
              stopScanning();
              performSearch(scannedText);

              // Reset last scanned code after 2 seconds
              setTimeout(() => setLastScannedCode(""), 2000);
            }

            if (err && !(err.name === "NotFoundException")) {
              console.error("Scanner Error:", err);
            }
          }
        );
      }
    } catch (error) {
      console.error("Camera Error:", error);
      toast.error("Camera access failed");
      setIsCameraOpen(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsCameraOpen(false);
  };

  const toggleCamera = async () => {
    if (isCameraOpen) {
      stopScanning();
      toast.success("Camera stopped");
    } else {
      setIsCameraOpen(true);
      toast.success("Camera started - Point at QR/Barcode");
      // Start scanning after state update
      setTimeout(() => startScanning(), 100);
    }
  };

  const formatDate = (dateString, timeString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString).toLocaleDateString();
    return timeString ? `${d} (${timeString})` : d;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Visitor Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find visitor details by scanning or typing ID
          </p>
        </div>
      </div>

      {/* Scanner Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlassIcon className="h-6 w-6" />
            Scanner Input
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  Start QR/Barcode Scanner
                </>
              )}
            </Button>
          </div>

          {/* ZXing Scanner */}
          {isCameraOpen && (
            <div className="bg-black rounded-lg overflow-hidden relative mb-6">
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                }}
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                QR/Barcode Scanner Active
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500/80 text-white px-3 py-1 rounded text-xs font-semibold">
                Supports QR Codes & Barcodes
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="visitorId">Visitor ID Input</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="visitorId"
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isCameraOpen
                      ? "Camera scanner active - or type here..."
                      : "Scan here..."
                  }
                  value={visitorId}
                  onChange={(e) => setVisitorId(e.target.value.toUpperCase())}
                  className="flex-1 text-lg font-mono placeholder:text-gray-300"
                  autoFocus={!isCameraOpen}
                  autoComplete="off"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loading
                      size="sm"
                      className="border-white border-t-transparent"
                    />
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <strong>Instructions:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  Use <strong>Camera Scanner</strong> for QR codes & Barcodes
                </li>
                <li>
                  Use handheld <strong>Barcode Scanner</strong> (cursor
                  auto-focuses)
                </li>
                <li>Visitor found → View full details below</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Visitor Details */}
      {visitor && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Main Info Card */}
          <Card className="border-t-4 border-t-green-500 shadow-lg">
            <CardHeader className="bg-green-50/50 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircleIcon className="h-6 w-6" />
                  Visitor Found
                </CardTitle>
                <Badge
                  className={
                    visitor.status === "checked-in"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }
                >
                  {visitor.status === "checked-in"
                    ? "Checked In"
                    : "Registered"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Photo & Basics */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-48 h-48 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-gray-100 relative">
                    <VisitorAvatar
                      photo={visitor.photo}
                      name={visitor.name}
                      visitorId={visitor.visitorId}
                      fallbackSrc={
                        fileManagerPhotos[visitor.photo] ||
                        fileManagerPhotos[
                          visitor.photo?.replace(/\.[^/.]+$/, "")
                        ] ||
                        fileManagerPhotos[
                          visitor.visitorId || visitor.id
                        ]
                      }
                      className="w-full h-full"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {visitor.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="mt-2 text-lg px-4 py-1 border-green-200 bg-green-50 text-green-800"
                  >
                    {visitor.visitorId}
                  </Badge>
                  <span className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-widest">
                    {visitor.category || "General"}
                  </span>
                </div>

                {/* Middle: Detailed Info */}
                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Company
                        </p>
                        <p className="text-gray-900 font-medium">
                          {visitor.companyName || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <PhoneIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Contact
                        </p>
                        <p className="text-gray-900">{visitor.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <MapPinIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          City
                        </p>
                        <p className="text-gray-900">{visitor.city || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <TicketIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Designation/Prof
                        </p>
                        <p className="text-gray-900">
                          {visitor.professions || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Email
                        </p>
                        <p
                          className="text-gray-900 text-sm truncate max-w-[150px]"
                          title={visitor.email}
                        >
                          {visitor.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel & Stay Info */}
          {visitor.travelDetails && visitor.travelDetails.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visitor.travelDetails.map((travel, idx) => (
                <Card key={idx} className="border-t-4 border-t-purple-500">
                  <CardHeader className="bg-purple-50/50 pb-2">
                    <CardTitle className="text-base text-purple-900 flex items-center gap-2">
                      <TruckIcon className="h-5 w-5" />
                      Travel:{" "}
                      {travel.type === "arrival"
                        ? "Arrival"
                        : travel.type === "departure"
                        ? "Departure"
                        : "Itinerary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          Date & Time
                        </p>
                        <p className="font-medium text-gray-900">
                          {travel.type === "arrival"
                            ? formatDate(travel.arrivalDate, travel.arrivalTime)
                            : formatDate(
                                travel.departureDate,
                                travel.departureTime
                              )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Mode</p>
                        <p className="font-medium text-gray-900">
                          {travel.travelBy} ({travel.flightTrainNo || "-"})
                        </p>
                      </div>
                    </div>

                    {/* Hotel Info */}
                    {travel.hotelAllotments &&
                      travel.hotelAllotments.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <HomeModernIcon className="h-4 w-4 text-purple-600" />
                            <p className="text-xs font-bold text-purple-800 uppercase">
                              Hotel Stay
                            </p>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {travel.hotelAllotments[0].hotelId?.hotelName ||
                              "Unknown Hotel"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Room:{" "}
                            {travel.hotelAllotments[0].roomId?.roomNumber ||
                              "Not Assigned"}
                          </p>
                        </div>
                      )}

                    {/* Driver Info */}
                    {travel.driverAllotments &&
                      travel.driverAllotments.length > 0 && (
                        <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                          <div className="flex items-center gap-2 mb-1">
                            <TruckIcon className="h-4 w-4 text-orange-600" />
                            <p className="text-xs font-bold text-orange-800 uppercase">
                              Driver Assigned
                            </p>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {travel.driverAllotments[0].driverId?.driverName ||
                              "Unknown Driver"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Vehicle:{" "}
                            {travel.driverAllotments[0].driverId?.vehicleNumber}
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scanner;
