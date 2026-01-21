import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  visitorAPI,
  API_BASE_URL,
  QR_CODE_API,
  getImageUrl,
  getPhotoFromFileManager,
} from "@/lib/api";
import { fileManagerAPI } from "@/lib/fileManagerAPI";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const VisitorCard = () => {
  const { id } = useParams();
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardSettings, setCardSettings] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [fileManagerPhotos, setFileManagerPhotos] = useState({}); // Add file manager photos
  const cardRef = useRef(null);

  useEffect(() => {
    fetchVisitor();
    loadCardSettings();
    fetchFileManagerPhotos(); // Fetch file manager photos
  }, [id]);

  useEffect(() => {
    if (visitor?.photo) {
      setCurrentPhotoUrl(getImageUrl(visitor.photo));
    }
  }, [visitor]);

  const handlePhotoError = async (e) => {
    console.log("Image load failed, trying File Manager fallback...");
    e.target.style.display = "none"; // Temporarily hide

    if (!visitor?.photo) return;

    // Extract filename if it includes path
    const filename = visitor.photo.split("/").pop();

    try {
      const fallbackUrl = await getPhotoFromFileManager(filename);
      if (fallbackUrl && fallbackUrl !== currentPhotoUrl) {
        console.log("Found in File Manager:", fallbackUrl);
        setCurrentPhotoUrl(fallbackUrl);
        e.target.style.display = "block"; // Show again
      }
    } catch (err) {
      console.error("Fallback failed:", err);
    }
  };

  const loadCardSettings = () => {
    const saved = localStorage.getItem("cardDesignSettings");
    console.log("🔍 [Card.jsx] Loading card settings:", saved ? "Found" : "Not found");
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      console.log("🔍 [Card.jsx] showQRCode setting:", parsedSettings.showQRCode);
      console.log("🔍 [Card.jsx] QR position:", parsedSettings.qrCodeTop, parsedSettings.qrCodeLeft);
      setCardSettings(parsedSettings);
    } else {
      // Default settings
      setCardSettings({
        imageWidth: 100,
        imageHeight: 100,
        imageTopMargin: 20,
        imageLeftMargin: 20,
        imageShape: "circle",
        bottomContainerWidth: 250,
        bottomContainerHeight: 150,
        bottomContainerTopMargin: 10,
        bottomContainerLeftMargin: 30,
        visitorNameFontSize: 18,
        visitorNameMarginTop: 140,
        visitorNameMarginLeft: 20,
        visitorNameWidth: 200,
        visitorNameHeight: 30,
        visitorNameColor: "#FFFFFF",
        visitorNameAlign: "left",
        visitorNameFontFamily: "Arial",
        companyNameFontSize: 14,
        companyNameMarginTop: 170,
        companyNameMarginLeft: 20,
        companyNameWidth: 200,
        companyNameHeight: 25,
        companyNameColor: "#FFFFFF",
        companyNameAlign: "left",
        companyNameFontFamily: "Arial",
        barcodeImageWidth: 200,
        barcodeImageHeight: 60,
        barcodeImageMarginTop: 10,
        barcodeImageMarginLeft: 25,
        showBarcode: true,
        qrCodeWidth: 100,
        qrCodeHeight: 100,
        qrCodeTop: 10,
        qrCodeLeft: 50,
        showQRCode: false,
        backgroundUrl: "",
      });
    }
  };

  const fetchFileManagerPhotos = async () => {
    try {
      console.log("📸 [Card] Fetching file manager photos...");

      const photosResponse = await fileManagerAPI.getPhotosFromPhotoFolder();

      console.log("📸 [Card] Photos response:", photosResponse);

      if (photosResponse.data.success) {
        const photos = photosResponse.data.data;
        const photoMap = {};

        photos.forEach((photo) => {
          // Map by filename without extension and with extension
          const nameWithoutExt = photo.name.replace(/\.[^/.]+$/, "");
          photoMap[photo.name] = photo.url;
          photoMap[nameWithoutExt] = photo.url;

          console.log(`📸 [Card] Mapped photo: ${photo.name} -> ${photo.url}`);
        });

        setFileManagerPhotos(photoMap);
        console.log(
          `📸 [Card] Total photos mapped: ${Object.keys(photoMap).length / 2}`,
          photoMap
        );
      } else {
        console.log("📸 [Card] No photos found in file manager photo folder");
      }
    } catch (error) {
      console.error("❌ [Card] Failed to fetch file manager photos:", error);
      // Set empty object to prevent repeated failed attempts
      setFileManagerPhotos({});
    }
  };

  const fetchVisitor = async () => {
    try {
      const response = await visitorAPI.getById(id);
      if (response.data.success) {
        setVisitor(response.data.data);
      } else {
        toast.error("Visitor not found");
      }
    } catch (error) {
      console.error("Error fetching visitor:", error);
      toast.error("Failed to load visitor details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    // Use current page print without opening new window
    window.print();

    // Mark as printed in background
    if (!visitor.isCardPrinted) {
      try {
        await visitorAPI.update(visitor._id || visitor.id, {
          isCardPrinted: true,
        });
        setVisitor((prev) => ({ ...prev, isCardPrinted: true }));
        toast.success('Card printed successfully!');
      } catch (error) {
        console.error("Failed to update print status:", error);
      }
    }
  };

  const handleDownload = () => {
    toast.info("Download feature coming soon!");
  };

  // Calculate print scale based on custom print size
  const calculatePrintScale = () => {
    if (!cardSettings) return 0.288; // Default scale for 89x127mm
    
    const printWidth = cardSettings.printWidth || 89;
    const printHeight = cardSettings.printHeight || 127;
    const printUnit = cardSettings.printUnit || "mm";
    
    // Convert to mm if needed
    const widthMm = printUnit === "inches" ? printWidth * 25.4 : printWidth;
    const heightMm = printUnit === "inches" ? printHeight * 25.4 : printHeight;
    
    // Original card design is 309x475px, standard print is 89x127mm
    // Calculate scale to fit custom size
    const scaleX = widthMm / 89 * 0.288;  // 0.288 is the base scale for 89mm
    const scaleY = heightMm / 127 * 0.288; // 0.288 is the base scale for 127mm
    
    // Use the smaller scale to ensure card fits within print area
    return Math.min(scaleX, scaleY);
  };

  // Get the calculated scale value for use in CSS
  const printScale = calculatePrintScale();

  // Convert 9-position alignment to Tailwind classes
  const getAlignmentClasses = (alignment) => {
    switch (alignment) {
      case "top-left":
        return "flex items-start justify-start text-left";
      case "top-center":
        return "flex items-start justify-center text-center";
      case "top-right":
        return "flex items-start justify-end text-right";
      case "center-left":
        return "flex items-center justify-start text-left";
      case "center":
        return "flex items-center justify-center text-center";
      case "center-right":
        return "flex items-center justify-end text-right";
      case "bottom-left":
        return "flex items-end justify-start text-left";
      case "bottom-center":
        return "flex items-end justify-center text-center";
      case "bottom-right":
        return "flex items-end justify-end text-right";
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  if (loading || !cardSettings) {
    return <PageLoading />;
  }

  if (!visitor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Visitor not found</p>
        <Link to="/visitors">
          <Button className="mt-4">Back to Visitors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/visitors">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Visitor ID Card
            </h1>
            <p className="text-gray-600 mt-1">
              {visitor.visitorId || visitor.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/card-designer">
            <Button variant="outline">Edit Card Design</Button>
          </Link>
          <Button onClick={handlePrint}>
            <PrinterIcon className="h-5 w-5 mr-2" />
            {visitor.isCardPrinted ? "Re-Print Card" : "Print Card"}
          </Button>
        </div>
        
        {/* Print Instructions - Removed as requested */}
      </div>

      {/* ID Card - Uses Card Designer Settings */}
      <div ref={cardRef} id="visitor-card" className="max-w-sm mx-auto">
        <div
          className="border-2 border-gray-300 shadow-xl mx-auto print:border-0 print:shadow-none id-card-bg print:bg-white"
          style={{
            width: "309px",
            height: "475px",
            backgroundImage: cardSettings.backgroundUrl
              ? `url(${cardSettings.backgroundUrl})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Photo Box - Positioned by settings */}
          <div
            style={{
              width: `${cardSettings.imageWidth}px`,
              height: `${cardSettings.imageHeight}px`,
              marginTop: `${cardSettings.imageTopMargin}px`,
              marginLeft: `${cardSettings.imageLeftMargin}px`,
              position: "relative",
              borderRadius:
                cardSettings.imageShape === "circle"
                  ? "50%"
                  : cardSettings.imageShape === "rounded"
                  ? "12px"
                  : "0",
              overflow: "hidden",
              border: "3px solid white",
              backgroundColor: "#fff",
            }}
          >
            <VisitorAvatar
              photo={visitor.photo}
              name={visitor.name}
              visitorId={visitor.visitorId || visitor.id}
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

          {/* Visitor Name - Positioned by settings */}
          <div
            className={`absolute whitespace-nowrap overflow-hidden text-ellipsis font-bold ${getAlignmentClasses(cardSettings.visitorNameAlign)}`}
            style={{
              fontSize: `${cardSettings.visitorNameFontSize}px`,
              top: `${Math.min(cardSettings.visitorNameMarginTop || 140, 475 - (cardSettings.visitorNameHeight || 30))}px`,
              left: `${Math.min(cardSettings.visitorNameMarginLeft || 20, 309 - (cardSettings.visitorNameWidth || 200))}px`,
              width: `${cardSettings.visitorNameWidth || 200}px`,
              height: `${cardSettings.visitorNameHeight || 30}px`,
              fontFamily: cardSettings.visitorNameFontFamily || "Arial",
              color: cardSettings.visitorNameColor || "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {visitor.name}
          </div>

          {/* Company Name - Positioned by settings */}
          <div
            className={`absolute whitespace-nowrap overflow-hidden text-ellipsis ${getAlignmentClasses(cardSettings.companyNameAlign)}`}
            style={{
              fontSize: `${cardSettings.companyNameFontSize}px`,
              top: `${Math.min(cardSettings.companyNameMarginTop || 170, 475 - (cardSettings.companyNameHeight || 25))}px`,
              left: `${Math.min(cardSettings.companyNameMarginLeft || 20, 309 - (cardSettings.companyNameWidth || 200))}px`,
              width: `${cardSettings.companyNameWidth || 200}px`,
              height: `${cardSettings.companyNameHeight || 25}px`,
              fontFamily: cardSettings.companyNameFontFamily || "Arial",
              color: cardSettings.companyNameColor || "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {visitor.companyName || "No Company"}
          </div>

          {/* Barcode - Positioned by settings */}
          {visitor.visitorId && cardSettings.showBarcode !== false && (
            <div
              style={{
                top: `${cardSettings.barcodeImageMarginTop}px`,
                left: `${cardSettings.barcodeImageMarginLeft}px`,
                position: "absolute",
              }}
            >
              <img
                src={`${API_BASE_URL}/barcode/${visitor.visitorId}`}
                alt="Barcode"
                style={{
                  width: `${cardSettings.barcodeImageWidth}px`,
                  height: `${cardSettings.barcodeImageHeight}px`,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* QR Code - Positioned by settings */}
          {(() => {
            const qrLeft = Math.min(cardSettings.qrCodeLeft || 50, 309 - (cardSettings.qrCodeWidth || 100));
            const qrTop = Math.min(cardSettings.qrCodeTop || 10, 475 - (cardSettings.qrCodeHeight || 100));
            
            console.log("🔍 [Card.jsx] QR Code check:", {
              visitorId: visitor.visitorId,
              showQRCode: cardSettings.showQRCode,
              shouldShow: visitor.visitorId && cardSettings.showQRCode,
              originalPosition: `${cardSettings.qrCodeTop}px, ${cardSettings.qrCodeLeft}px`,
              clampedPosition: `${qrTop}px, ${qrLeft}px`,
              cardSize: "309x475px"
            });
            return visitor.visitorId && cardSettings.showQRCode;
          })() && (
            <div
              style={{
                top: `${Math.min(cardSettings.qrCodeTop || 10, 475 - (cardSettings.qrCodeHeight || 100))}px`,
                left: `${Math.min(cardSettings.qrCodeLeft || 50, 309 - (cardSettings.qrCodeWidth || 100))}px`,
                position: "absolute",
                display: "inline-block",
              }}
            >
              <img
                src={`${QR_CODE_API}/?size=${cardSettings.qrCodeWidth}x${cardSettings.qrCodeHeight}&data=${visitor.visitorId}`}
                alt="QR Code"
                style={{
                  width: `${cardSettings.qrCodeWidth}px`,
                  height: `${cardSettings.qrCodeHeight}px`,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              {/* QR Code Number - Like barcode */}
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#000",
                  textAlign: "center",
                  marginTop: "2px",
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                  textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                {visitor.visitorId}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles to hide browser UI */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 89mm 127mm;
            orientation: portrait;
          }
          
          /* Hide everything first */
          body * {
            visibility: hidden !important;
          }
          
          /* Show only the visitor card and its contents */
          #visitor-card,
          #visitor-card * {
            visibility: visible !important;
          }
          
          /* Hide browser UI elements */
          header,
          nav,
          .header,
          .navbar,
          .menu,
          .sidebar,
          .toolbar,
          button,
          .btn,
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Position and size the card for print */
          #visitor-card {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          /* Remove background from card - only white */
          #visitor-card > div {
            width: 309px !important;
            height: 475px !important;
            transform: scale(1) !important;
            transform-origin: center center !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            background-image: none !important;
          }
          
          /* Make text black for visibility on white background */
          #visitor-card div[style*="color"] {
            color: #000000 !important;
            text-shadow: none !important;
          }
          
          /* Ensure colors print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* No page breaks */
          #visitor-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VisitorCard;
