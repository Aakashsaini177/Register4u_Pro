import React, { useState, useEffect, useRef } from "react";
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

          <div className="text-right">
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

            {/* Place Selection */}
            {places.length > 0 ? (
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
            )}
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
                  <div className="w-48 h-48 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-muted relative">
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
                      className="w-full h-full"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {visitor.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="mt-2 text-lg px-4 py-1 border-green-200 bg-green-50 text-green-800"
                  >
                    {visitor.visitorId}
                  </Badge>
                  <span className="mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    {visitor.category || "General"}
                  </span>
                </div>

                {/* Middle: Detailed Info */}
                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <BuildingOfficeIcon className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Company
                        </p>
                        <p className="text-foreground font-medium">
                          {visitor.companyName || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <PhoneIcon className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Contact
                        </p>
                        <p className="text-foreground">{visitor.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <MapPinIcon className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          City
                        </p>
                        <p className="text-foreground">
                          {visitor.city || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <TicketIcon className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Designation/Prof
                        </p>
                        <p className="text-foreground">
                          {visitor.professions || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <EnvelopeIcon className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Email
                        </p>
                        <p
                          className="text-foreground text-sm truncate max-w-[150px]"
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
