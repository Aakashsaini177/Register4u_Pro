import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  visitorAPI,
  API_BASE_URL,
  getImageUrl,
  getPhotoFromFileManager,
} from "@/lib/api";
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
  const cardRef = useRef(null);

  useEffect(() => {
    fetchVisitor();
    loadCardSettings();
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
    if (saved) {
      setCardSettings(JSON.parse(saved));
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
        visitorNameColor: "#FFFFFF",
        visitorNameAlign: "left",
        visitorNameFontFamily: "Arial",
        companyNameFontSize: 14,
        companyNameMarginTop: 170,
        companyNameMarginLeft: 20,
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
        qrCodeMarginTop: 10,
        qrCodeMarginLeft: 50,
        showQRCode: false,
        backgroundUrl: "",
      });
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
    // 1. Open print dialog
    window.print();

    // 2. Mark as printed in background (only if not already printed)
    if (!visitor.isCardPrinted) {
      try {
        await visitorAPI.update(visitor._id || visitor.id, {
          isCardPrinted: true,
        });
        // Update local state to show "Re-Print" next time
        setVisitor((prev) => ({ ...prev, isCardPrinted: true }));
      } catch (error) {
        console.error("Failed to update print status:", error);
      }
    }
  };

  const handleDownload = () => {
    toast.info("Download feature coming soon!");
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
      </div>

      {/* ID Card - Uses Card Designer Settings */}
      <div ref={cardRef} id="visitor-card" className="max-w-sm mx-auto">
        <div
          className="border-2 border-gray-300 shadow-xl mx-auto print:border-0 print:shadow-none id-card-bg"
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
              className="w-full h-full"
            />
          </div>

          {/* Visitor Name - Positioned by settings */}
          <div
            style={{
              fontSize: `${cardSettings.visitorNameFontSize}px`,
              top: `${cardSettings.visitorNameMarginTop}px`,
              left: 0,
              width: "100%",
              textAlign: cardSettings.visitorNameAlign,
              paddingLeft:
                cardSettings.visitorNameAlign === "left"
                  ? `${cardSettings.visitorNameMarginLeft}px`
                  : 0,
              paddingRight:
                cardSettings.visitorNameAlign === "right"
                  ? `${cardSettings.visitorNameMarginLeft}px`
                  : 0,
              fontWeight: "bold",
              fontFamily: cardSettings.visitorNameFontFamily || "Arial",
              color: cardSettings.visitorNameColor || "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              position: "absolute",
              whiteSpace: "nowrap",
            }}
          >
            {visitor.name}
          </div>

          {/* Company Name - Positioned by settings */}
          <div
            style={{
              fontSize: `${cardSettings.companyNameFontSize}px`,
              top: `${cardSettings.companyNameMarginTop}px`,
              left: 0,
              width: "100%",
              textAlign: cardSettings.companyNameAlign,
              paddingLeft:
                cardSettings.companyNameAlign === "left"
                  ? `${cardSettings.companyNameMarginLeft}px`
                  : 0,
              paddingRight:
                cardSettings.companyNameAlign === "right"
                  ? `${cardSettings.companyNameMarginLeft}px`
                  : 0,
              fontFamily: cardSettings.companyNameFontFamily || "Arial",
              color: cardSettings.companyNameColor || "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              position: "absolute",
              whiteSpace: "nowrap",
            }}
          >
            {visitor.companyName || "No Company"}
          </div>

          {/* Barcode - Positioned by settings */}
          {visitor.visitorId && cardSettings.showBarcode !== false && (
            <div
              style={{
                marginTop: `${cardSettings.barcodeImageMarginTop}px`,
                marginLeft: `${cardSettings.barcodeImageMarginLeft}px`,
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
          {visitor.visitorId && cardSettings.showQRCode && (
            <div
              style={{
                marginTop: `${cardSettings.qrCodeMarginTop}px`,
                marginLeft: `${cardSettings.qrCodeMarginLeft}px`,
                position: "absolute",
                display: "inline-block",
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=${cardSettings.qrCodeWidth}x${cardSettings.qrCodeHeight}&data=${visitor.visitorId}`}
                alt="QR Code"
                style={{
                  width: `${cardSettings.qrCodeWidth}px`,
                  height: `${cardSettings.qrCodeHeight}px`,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional Info - Hidden on print */}
      <div className="max-w-sm mx-auto print:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Visitor ID:</p>
                <p className="font-semibold">
                  {visitor.visitorId || visitor.id}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Category:</p>
                <p className="font-semibold">{visitor.category || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Contact:</p>
                <p className="font-semibold">{visitor.contact || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Email:</p>
                <p className="font-semibold">{visitor.email || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          
          body * {
            visibility: hidden;
          }
          
          #visitor-card, 
          #visitor-card * {
            visibility: visible;
          }
          
          #visitor-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            page-break-after: always;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          /* Ensure background images print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
                    /* Hide print button and other UI elements */
          .print\\:hidden {
            display: none !important;
          }

          /* Hide background image on print */
          /* Hide background image on print */
          .id-card-bg {
            background-image: none !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }

          /* Force images to be visible */
          #visitor-card img {
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VisitorCard;
