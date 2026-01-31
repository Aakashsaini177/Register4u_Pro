import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { visitorAPI, getImageUrl, authAPI } from "@/lib/api";
import api from "@/lib/api";
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
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const Scanner = () => {
  const { token, employee, isEmployee } = useAuthStore();
  const [visitorId, setVisitorId] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false); // Toggle for location info
  const [loading, setLoading] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [codeReader, setCodeReader] = useState(null);
  const [fileManagerPhotos, setFileManagerPhotos] = useState({}); // Add file manager photos
  const [scanHistory, setScanHistory] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [loadingPlaces, setLoadingPlaces] = useState(false);
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
    fetchScanHistory();
    fetchMyPlaces();

    return () => {
      if (reader) {
        reader.reset();
      }
    };
  }, []);

  const fetchMyPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const response = await api.get("/places/my-places");
      if (response.data.success) {
        const placesData = response.data.data || [];
        setPlaces(placesData);

        // Auto-select place logic - ALWAYS auto-select if employee has places
        if (placesData.length === 1) {
          // Auto-select if only one place
          setSelectedPlace(placesData[0]._id);
          console.log(`Auto-selected place: ${placesData[0].name}`);
        } else if (placesData.length > 1) {
          // Auto-select first place if multiple (employee can change if needed)
          setSelectedPlace(placesData[0]._id);
          console.log(
            `Auto-selected first place: ${placesData[0].name} (employee can change if needed)`,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      // Don't show error toast as this might not be available for all employees
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [codeReader]);

  const fetchScanHistory = async () => {
    try {
      // Fetch recent scan history for current employee
      const response = await visitorAPI.getScanHistory();
      if (response.data.success) {
        setScanHistory(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching scan history:", error);
      // Don't show error toast as this is optional data
    }
  };

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
      const scanData = { visitorId: id };
      if (selectedPlace) {
        scanData.placeId = selectedPlace;
      }

      const response = await api.post("/visitors/scan", scanData);

      if (response.data.success) {
        const foundVisitor = response.data.data;
        setVisitor(foundVisitor);

        const selectedPlaceName = places.find((p) => p._id === selectedPlace);
        const successMessage = selectedPlaceName
          ? `Visitor found: ${foundVisitor.name} at ${selectedPlaceName.name}`
          : `Visitor found: ${foundVisitor.name}`;

        toast.success(successMessage);
        setVisitorId("");

        // Update scan history
        fetchScanHistory();
      } else {
        toast.error("Visitor not found");
      }
    } catch (error) {
      console.error("Scanner Error:", error);
      // Handle 404 specifically
      if (error.response && error.response.status === 404) {
        toast.error("Visitor not found");
      } else if (error.response && error.response.status === 403) {
        toast.error("You are not assigned to scan at the selected place");
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

          console.log(
            `📸 [Scanner] Mapped photo: ${photo.name} -> ${photo.url}`,
          );
        });

        setFileManagerPhotos(photoMap);
        console.log(
          `📸 [Scanner] Total photos mapped: ${Object.keys(photoMap).length / 2}`,
          photoMap,
        );
      } else {
        console.log(
          "📸 [Scanner] No photos found in file manager photo folder",
        );
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
        (device) => device.kind === "videoinput",
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
          },
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
          },
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
      {/* Enhanced Header with Employee Info */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Scanner Icon */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Visitor Scanner</h1>
              <p className="text-blue-100 mt-1">
                Find visitor details by scanning or typing ID
              </p>

              {/* Employee Info */}
              {isEmployee() && employee && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-100">
                  <ShieldCheckIcon className="h-3 w-3" />
                  <span>Operator: {employee.name}</span>
                  {employee.emp_code && (
                    <span className="ml-2">({employee.emp_code})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location Info Button */}
          <div className="text-right">
            {selectedPlace && places && places.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() => setShowLocationInfo(!showLocationInfo)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                  title="View Scanning Location"
                >
                  <MapPinIcon className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    {showLocationInfo ? "Hide" : "Show"} Location
                  </span>
                </button>
                {showLocationInfo && (
                  <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-left">
                    <p className="text-xs text-blue-100 uppercase font-semibold mb-1">
                      📍 Scanning At
                    </p>
                    <p className="text-white font-bold">
                      {places.find((p) => p._id === selectedPlace)?.name ||
                        "Unknown"}
                    </p>
                    {places.find((p) => p._id === selectedPlace)?.placeCode && (
                      <p className="text-xs text-blue-100 mt-1">
                        Code:{" "}
                        {places.find((p) => p._id === selectedPlace)?.placeCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <p className="text-blue-100 text-sm">Scanner Status</p>
            <p className="text-lg font-semibold">
              {isCameraOpen ? "Camera Active" : "Ready"}
            </p>
            <div className="mt-2">
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs ${
                  token ? "text-green-200" : "text-red-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${token ? "bg-green-400" : "bg-red-400"}`}
                ></div>
                {token ? "Authenticated" : "Guest Mode"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Input - Compact */}
      <Card className="shadow-md">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Scanner Input
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {/* Camera Toggle Button */}
          <div className="flex justify-center mb-3">
            <Button
              type="button"
              onClick={toggleCamera}
              variant={isCameraOpen ? "destructive" : "default"}
              className="w-full h-9 text-sm"
            >
              {isCameraOpen ? (
                <>
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Close Camera
                </>
              ) : (
                <>
                  <VideoCameraIcon className="h-4 w-4 mr-1" />
                  Scan with Camera
                </>
              )}
            </Button>
          </div>

          {/* ZXing Scanner */}
          {isCameraOpen && (
            <div className="bg-black rounded-lg overflow-hidden relative mb-3">
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                }}
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                Scanner Active
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-2">
            <div>
              <Label htmlFor="visitorId" className="text-sm">
                Visitor ID
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="visitorId"
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isCameraOpen ? "Camera active..." : "Type or scan ID..."
                  }
                  value={visitorId}
                  onChange={(e) => setVisitorId(e.target.value.toUpperCase())}
                  className="flex-1 h-9 text-base font-mono"
                  autoFocus={!isCameraOpen}
                  autoComplete="off"
                />
                <Button type="submit" disabled={loading} className="h-9 px-3">
                  {loading ? (
                    <Loading
                      size="sm"
                      className="border-white border-t-transparent"
                    />
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                      Search
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="h-9 px-3"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Place Selection - Hidden, now shown in header */}
            {/* {places.length > 0 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                <Label
                  htmlFor="placeSelect"
                  className="text-green-700 dark:text-green-300 font-medium"
                >
                  📍 Scanning Location (Auto-Selected)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPinIcon className="h-5 w-5 text-green-500" />
                  <select
                    id="placeSelect"
                    value={selectedPlace}
                    onChange={(e) => setSelectedPlace(e.target.value)}
                    className="flex-1 px-3 py-2 border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-foreground rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loadingPlaces}
                  >
                    {places.map((place) => (
                      <option key={place._id} value={place._id}>
                        {place.name} ({place.placeCode})
                        {place.location && ` - ${place.location}`}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  ✅ All scans will be automatically logged for:{" "}
                  {places.find((p) => p._id === selectedPlace)?.name}
                  {places.length > 1 && (
                    <span className="text-green-500 dark:text-green-400 ml-2">
                      (You can change if needed)
                    </span>
                  )}
                </p>
              </div>
            ) : (
              !loadingPlaces && (
                <div className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <MapPinIcon className="h-5 w-5" />
                    <span className="font-medium">No Places Assigned</span>
                  </div>
                </div>
              )
            )} */}
          </form>
        </CardContent>
      </Card>

      {/* Visitor Details - Enhanced */}
      {visitor && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Main Info Card - Enhanced */}
          <Card className="border-t-8 border-t-green-500 shadow-2xl bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white pb-4 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white text-2xl">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-7 w-7" />
                  </div>
                  ✅ Visitor Found
                </CardTitle>
                <Badge
                  className={
                    visitor.status === "checked-in"
                      ? "bg-blue-600 text-white text-base px-4 py-2"
                      : "bg-white text-green-600 text-base px-4 py-2 font-bold"
                  }
                >
                  {visitor.status === "checked-in"
                    ? "✓ Checked In"
                    : "📝 Registered"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Photo & Basics - Enhanced */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-56 h-56 rounded-full border-8 border-green-500 shadow-2xl overflow-hidden mb-6 bg-muted relative ring-4 ring-green-200 dark:ring-green-800">
                    <VisitorAvatar
                      photo={visitor.photo}
                      name={visitor.name}
                      visitorId={visitor.visitorId}
                      fallbackSrc={
                        fileManagerPhotos[visitor.photo] ||
                        fileManagerPhotos[
                          visitor.photo?.replace(/\.[^/.]+$/, "")
                        ] ||
                        fileManagerPhotos[visitor.visitorId || visitor.id]
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {visitor.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="mt-2 text-xl px-6 py-2 border-2 border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-mono font-bold"
                  >
                    {visitor.visitorId}
                  </Badge>
                  <span className="mt-3 text-base font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                    {visitor.category || "General"}
                  </span>
                </div>

                {/* Middle: Detailed Info - Enhanced */}
                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800">
                      <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 uppercase font-bold tracking-wide mb-1">
                          Company
                        </p>
                        <p className="text-foreground font-bold text-base">
                          {visitor.companyName || "N/A"}
                        </p>
                      </div>
                    </div>
                    {/* <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200 dark:border-purple-800">
                      <PhoneIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1" />
                      <div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 uppercase font-bold tracking-wide mb-1">
                          Contact
                        </p>
                        <p className="text-foreground font-bold text-base">
                          {visitor.contact}
                        </p>
                      </div>
                    </div> */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800">
                      <MapPinIcon className="h-6 w-6 text-orange-600 dark:text-orange-400 mt-1" />
                      <div>
                        <p className="text-xs text-orange-700 dark:text-orange-300 uppercase font-bold tracking-wide mb-1">
                          City
                        </p>
                        <p className="text-foreground font-bold text-base">
                          {visitor.city || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 border border-indigo-200 dark:border-indigo-800">
                      <TicketIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                      <div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 uppercase font-bold tracking-wide mb-1">
                          Designation/Prof
                        </p>
                        <p className="text-foreground font-bold text-base">
                          {visitor.professions || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 border border-pink-200 dark:border-pink-800">
                      <EnvelopeIcon className="h-6 w-6 text-pink-600 dark:text-pink-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-pink-700 dark:text-pink-300 uppercase font-bold tracking-wide mb-1">
                          Email
                        </p>
                        <p
                          className="text-foreground font-semibold text-sm break-all"
                          title={visitor.email}
                        >
                          {visitor.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scan Location Display - Shows where visitor was scanned */}
                  {selectedPlace && places && places.length > 0 && (
                    <div className="col-span-2">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-2 border-green-300 dark:border-green-700">
                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                          <MapPinIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          {/* <p className="text-xs text-green-700 dark:text-green-300 uppercase font-semibold mb-1">
                            📍 Scanned At
                          </p> */}
                          <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                            {places.find((p) => p._id === selectedPlace)
                              ?.name || "Unknown Location"}
                          </h3>
                          {/* {places.find((p) => p._id === selectedPlace)
                            ?.placeCode && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Code:{" "}
                              {
                                places.find((p) => p._id === selectedPlace)
                                  ?.placeCode
                              }
                            </p>
                          )} */}
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                            ✓ Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Button */}
          <div className="flex justify-center mt-4">
            <Link to={`/visitors/history/${visitor._id || visitor.id}`}>
              <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg">
                <ClockIcon className="h-5 w-5" />
                View Activity History
              </Button>
            </Link>
          </div>

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
                                travel.departureTime,
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
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <HomeModernIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-bold text-purple-800 dark:text-purple-200 uppercase">
                              Hotel Stay
                            </p>
                          </div>
                          <p className="text-sm text-foreground font-medium">
                            {travel.hotelAllotments[0].hotelId?.hotelName ||
                              "Unknown Hotel"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Room:{" "}
                            {travel.hotelAllotments[0].roomId?.roomNumber ||
                              "Not Assigned"}
                          </p>
                        </div>
                      )}

                    {/* Driver Info */}
                    {travel.driverAllotments &&
                      travel.driverAllotments.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md border border-orange-100 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-1">
                            <TruckIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <p className="text-xs font-bold text-orange-800 dark:text-orange-200 uppercase">
                              Driver Assigned
                            </p>
                          </div>
                          <p className="text-sm text-foreground font-medium">
                            {travel.driverAllotments[0].driverId?.driverName ||
                              "Unknown Driver"}
                          </p>
                          <p className="text-xs text-muted-foreground">
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

      {/* Recent Scan History */}
      {isEmployee() && scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              My Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.slice(0, 5).map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <VisitorAvatar
                      photo={scan.visitor?.photo}
                      name={scan.visitor?.name}
                      visitorId={scan.visitor?.visitorId}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {scan.visitor?.name || "Unknown Visitor"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {scan.visitor?.visitorId} •{" "}
                      {scan.visitor?.companyName || "No Company"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(scan.scannedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.scannedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Scanner;
