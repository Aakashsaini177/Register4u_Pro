import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { settingsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { CheckCircleIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const CardDesigner = () => {

  // Color palette for easy selection
  const colorPalette = [
    // Standard Colors (Row 1)
    "#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF", "#FFFFFF", "#000000",
    // Standard Colors (Row 2) 
    "#FFA500", "#FFFF80", "#FF8000", "#FF6B6B", "#DC143C", "#FF69B4", "#FF1493", "#4169E1",
    // Standard Colors (Row 3)
    "#0080FF", "#008080", "#00FF80", "#80FF00", "#FFFF00", "#FFFF80", "#FFFF40",
    // Custom Colors
    "#8A2BE2", "#00FF00", "#4682B4", "#8B0000", "#FF0000", "#FFB6C1", "#F5F5F5", "#20B2AA"
  ];

  // Color Palette Component
  const ColorPalette = ({ currentColor, onColorChange, label }) => (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-2">
        {/* Current Color Display */}
        <div className="flex items-center gap-2 mb-3">
          <div 
            className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer"
            style={{ backgroundColor: currentColor }}
            title={`Current: ${currentColor}`}
          />
          <Input
            type="text"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            placeholder="#FFFFFF"
            className="flex-1 text-sm"
          />
        </div>
        
        {/* Color Palette Grid */}
        <div className="grid grid-cols-8 gap-1 p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
          {colorPalette.map((color, index) => (
            <button
              key={index}
              type="button"
              className={`w-6 h-6 border-2 rounded cursor-pointer hover:scale-110 transition-transform ${
                currentColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              title={color}
            />
          ))}
        </div>
        
        {/* Custom Color Picker */}
        <div className="mt-2">
          <Input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full h-8 cursor-pointer"
            title="Custom color picker"
          />
        </div>
      </div>
    </div>
  );

  // Refs for draggable elements
  const imageDivRef = useRef(null);
  const imageBoxRef = useRef(null);
  const detailBoxRef = useRef(null);
  const visitorNameRef = useRef(null);
  const companyNameRef = useRef(null);
  const barcodeRef = useRef(null);

  // Drag state
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Resize state
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Image properties
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [imageTopMargin, setImageTopMargin] = useState(20);
  const [imageBottomMargin, setImageBottomMargin] = useState(0);
  const [imageLeftMargin, setImageLeftMargin] = useState(20);
  const [imageRightMargin, setImageRightMargin] = useState(0);
  const [imageShape, setImageShape] = useState("circle"); // circle or square

  // Detail box properties
  const [bottomContainerWidth, setBottomContainerWidth] = useState(250);
  const [bottomContainerHeight, setBottomContainerHeight] = useState(150);
  const [bottomContainerTopMargin, setBottomContainerTopMargin] = useState(10);
  const [bottomContainerBottomMargin, setBottomContainerBottomMargin] =
    useState(0);
  const [bottomContainerLeftMargin, setBottomContainerLeftMargin] =
    useState(30);
  const [bottomContainerRightMargin, setBottomContainerRightMargin] =
    useState(0);

  // Visitor name properties
  const [visitorNameWidth, setVisitorNameWidth] = useState(200);
  const [visitorNameHeight, setVisitorNameHeight] = useState(30);
  const [visitorNameFontSize, setVisitorNameFontSize] = useState(18);
  const [visitorNameMarginTop, setVisitorNameMarginTop] = useState(140);
  const [visitorNameMarginBottom, setVisitorNameMarginBottom] = useState(0);
  const [visitorNameMarginRight, setVisitorNameMarginRight] = useState(0);
  const [visitorNameMarginLeft, setVisitorNameMarginLeft] = useState(20);
  const [visitorNameColor, setVisitorNameColor] = useState("#FFFFFF");
  const [visitorNameAlign, setVisitorNameAlign] = useState("left");
  const [visitorNameFontFamily, setVisitorNameFontFamily] = useState("Arial");

  // Company name properties
  const [companyNameWidth, setCompanyNameWidth] = useState(200);
  const [companyNameHeight, setCompanyNameHeight] = useState(25);
  const [companyNameFontSize, setCompanyNameFontSize] = useState(14);
  const [companyNameMarginTop, setCompanyNameMarginTop] = useState(170);
  const [companyNameMarginBottom, setCompanyNameMarginBottom] = useState(0);
  const [companyNameMarginRight, setCompanyNameMarginRight] = useState(0);
  const [companyNameMarginLeft, setCompanyNameMarginLeft] = useState(20);
  const [companyNameColor, setCompanyNameColor] = useState("#FFFFFF");
  const [companyNameAlign, setCompanyNameAlign] = useState("left");
  const [companyNameFontFamily, setCompanyNameFontFamily] = useState("Arial");

  // Barcode properties
  const [barcodeImageWidth, setBarcodeImageWidth] = useState(200);
  const [barcodeImageHeight, setBarcodeImageHeight] = useState(60);
  const [barcodeImageMarginTop, setBarcodeImageMarginTop] = useState(10);
  const [barcodeImageMarginRight, setBarcodeImageMarginRight] = useState(0);
  const [barcodeImageMarginBottom, setBarcodeImageMarginBottom] = useState(10);
  const [barcodeImageMarginLeft, setBarcodeImageMarginLeft] = useState(25);
  const [barcodeType, setBarcodeType] = useState("barcode"); // barcode or qr
  const [showBarcode, setShowBarcode] = useState(true);

  // QR Code properties
    const [qrCodeWidth, setQrCodeWidth] = useState(100);
    const [qrCodeHeight, setQrCodeHeight] = useState(100);
    const [qrCodeTop, setQrCodeTop] = useState(10);
    const [qrCodeLeft, setQrCodeLeft] = useState(50);
  const [showQRCode, setShowQRCode] = useState(false);

  // Background image
  const [backImage, setBackImage] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Advanced settings toggle
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Print size settings
  const [printWidth, setPrintWidth] = useState(89); // mm
  const [printHeight, setPrintHeight] = useState(127); // mm
  const [printUnit, setPrintUnit] = useState("mm"); // mm or inches

  // Convert 9-position alignment to Tailwind classes (same as Card.jsx)
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

  // Load saved settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("🔄 Loading card design settings from backend...");
        const response = await settingsAPI.getCardDesignSettings();
        
        if (response.data.success) {
          const settings = response.data.data;
          console.log("✅ Card design settings loaded:", settings);
          
          if (settings) {
            const cardWidth = 309;
            const cardHeight = 475;
            
            // Validate and load image settings with bounds checking
            const imgWidth = Math.max(10, Math.min(settings.imageWidth || 100, cardWidth));
            const imgHeight = Math.max(10, Math.min(settings.imageHeight || 100, cardHeight));
            const imgTop = Math.max(0, Math.min(settings.imageTopMargin || 20, cardHeight - imgHeight));
            const imgLeft = Math.max(0, Math.min(settings.imageLeftMargin || 20, cardWidth - imgWidth));
            
            setImageWidth(imgWidth);
            setImageHeight(imgHeight);
            setImageTopMargin(imgTop);
            setImageBottomMargin(settings.imageBottomMargin || 0);
            setImageLeftMargin(imgLeft);
            setImageRightMargin(settings.imageRightMargin || 0);
            setImageShape(settings.imageShape || "circle");

            setBottomContainerWidth(settings.bottomContainerWidth || 250);
            setBottomContainerHeight(settings.bottomContainerHeight || 150);
            setBottomContainerTopMargin(settings.bottomContainerTopMargin || 10);
            setBottomContainerBottomMargin(settings.bottomContainerBottomMargin || 0);
            setBottomContainerLeftMargin(settings.bottomContainerLeftMargin || 30);
            setBottomContainerRightMargin(settings.bottomContainerRightMargin || 0);

            // Validate and load visitor name settings with bounds checking
            const visNameWidth = Math.max(10, Math.min(settings.visitorNameWidth || 200, cardWidth));
            const visNameHeight = Math.max(10, Math.min(settings.visitorNameHeight || 30, cardHeight));
            const visNameTop = Math.max(0, Math.min(settings.visitorNameMarginTop || 140, cardHeight - visNameHeight));
            const visNameLeft = Math.max(0, Math.min(settings.visitorNameMarginLeft || 20, cardWidth - visNameWidth));
            
            setVisitorNameWidth(visNameWidth);
            setVisitorNameHeight(visNameHeight);
            setVisitorNameFontSize(settings.visitorNameFontSize || 18);
            setVisitorNameMarginTop(visNameTop);
            setVisitorNameMarginBottom(settings.visitorNameMarginBottom || 0);
            setVisitorNameMarginRight(settings.visitorNameMarginRight || 0);
            setVisitorNameMarginLeft(visNameLeft);
            setVisitorNameColor(settings.visitorNameColor || "#FFFFFF");
            setVisitorNameAlign(settings.visitorNameAlign || "left");
            setVisitorNameFontFamily(settings.visitorNameFontFamily || "Arial");

            // Validate and load company name settings with bounds checking
            const compNameWidth = Math.max(10, Math.min(settings.companyNameWidth || 200, cardWidth));
            const compNameHeight = Math.max(10, Math.min(settings.companyNameHeight || 25, cardHeight));
            const compNameTop = Math.max(0, Math.min(settings.companyNameMarginTop || 170, cardHeight - compNameHeight));
            const compNameLeft = Math.max(0, Math.min(settings.companyNameMarginLeft || 20, cardWidth - compNameWidth));
            
            setCompanyNameWidth(compNameWidth);
            setCompanyNameHeight(compNameHeight);
            setCompanyNameFontSize(settings.companyNameFontSize || 14);
            setCompanyNameMarginTop(compNameTop);
            setCompanyNameMarginBottom(settings.companyNameMarginBottom || 0);
            setCompanyNameMarginRight(settings.companyNameMarginRight || 0);
            setCompanyNameMarginLeft(compNameLeft);
            setCompanyNameColor(settings.companyNameColor || "#FFFFFF");
            setCompanyNameAlign(settings.companyNameAlign || "left");
            setCompanyNameFontFamily(settings.companyNameFontFamily || "Arial");

            // Validate and load barcode settings with bounds checking
            const barcodeWidth = Math.max(10, Math.min(Number(settings.barcodeImageWidth ?? 200), cardWidth));
            const barcodeHeight = Math.max(10, Math.min(Number(settings.barcodeImageHeight ?? 60), cardHeight));
            const barcodeTop = Math.max(0, Math.min(Number(settings.barcodeImageMarginTop ?? 10), cardHeight - barcodeHeight));
            const barcodeLeft = Math.max(0, Math.min(Number(settings.barcodeImageMarginLeft ?? 25), cardWidth - barcodeWidth));
            
            setBarcodeImageWidth(barcodeWidth);
            setBarcodeImageHeight(barcodeHeight);
            setBarcodeImageMarginTop(barcodeTop);
            setBarcodeImageMarginRight(Number(settings.barcodeImageMarginRight ?? 0));
            setBarcodeImageMarginBottom(Number(settings.barcodeImageMarginBottom ?? 10));
            setBarcodeImageMarginLeft(barcodeLeft);
            setBarcodeType(settings.barcodeType || "barcode");
            setShowBarcode(
              settings.showBarcode !== undefined ? settings.showBarcode : true
            );

            // Validate and load QR code settings with bounds checking
            const qrWidth = Math.max(10, Math.min(Number(settings.qrCodeWidth ?? 100), cardWidth));
            const qrHeight = Math.max(10, Math.min(Number(settings.qrCodeHeight ?? 100), cardHeight));
            const qrTop = Math.max(0, Math.min(Number(settings.qrCodeTop ?? 10), cardHeight - qrHeight));
            const qrLeft = Math.max(0, Math.min(Number(settings.qrCodeLeft ?? 50), cardWidth - qrWidth));
            
            setQrCodeWidth(qrWidth);
            setQrCodeHeight(qrHeight);
            setQrCodeTop(qrTop);
            setQrCodeLeft(qrLeft);
            setShowQRCode(
              settings.showQRCode !== undefined ? settings.showQRCode : false
            );

            if (settings.backgroundUrl) {
              setBackgroundUrl(settings.backgroundUrl);
            }

            // Load print size settings
            setPrintWidth(settings.printWidth || 89);
            setPrintHeight(settings.printHeight || 127);
            setPrintUnit(settings.printUnit || "mm");
          }
        }
      } catch (error) {
        console.error("❌ Error loading card design settings:", error);
        toast.error("Failed to load card design settings");
        
        // Fallback to localStorage if backend fails
        const saved = localStorage.getItem("cardDesignSettings");
        if (saved) {
          console.log("🔄 Falling back to localStorage settings");
          const settings = JSON.parse(saved);
          // Apply the same loading logic as above for localStorage fallback
          // (keeping the existing localStorage loading code as fallback)
        }
      }
    };

    loadSettings();
  }, []);

  // Text Alignment Handler (9-position grid)
  const handleTextAlignment = (type, alignment) => {
    if (type === "visitor") {
      setVisitorNameAlign(alignment);
    } else if (type === "company") {
      setCompanyNameAlign(alignment);
    }
  };

  // Drag handlers
  const handleMouseDown = (e, elementType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(elementType);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Card dimensions
    const cardWidth = 309;
    const cardHeight = 475;

    switch (dragging) {
      case "imageBox": {
        setImageLeftMargin((prev) => {
          const newLeft = (prev || 0) + deltaX;
          return Math.max(0, Math.min(newLeft, cardWidth - imageWidth));
        });
        setImageTopMargin((prev) => {
          const newTop = (prev || 0) + deltaY;
          return Math.max(0, Math.min(newTop, cardHeight - imageHeight));
        });
        break;
      }
      case "visitorName": {
        setVisitorNameMarginLeft((prev) => {
          const newLeft = (prev || 0) + deltaX;
          return Math.max(0, Math.min(newLeft, cardWidth - visitorNameWidth));
        });
        setVisitorNameMarginTop((prev) => {
          const newTop = (prev || 0) + deltaY;
          return Math.max(0, Math.min(newTop, cardHeight - visitorNameHeight));
        });
        break;
      }
      case "companyName": {
        setCompanyNameMarginLeft((prev) => {
          const newLeft = (prev || 0) + deltaX;
          return Math.max(0, Math.min(newLeft, cardWidth - companyNameWidth));
        });
        setCompanyNameMarginTop((prev) => {
          const newTop = (prev || 0) + deltaY;
          return Math.max(0, Math.min(newTop, cardHeight - companyNameHeight));
        });
        break;
      }
      case "barcode": {
        setBarcodeImageMarginLeft((prev) => {
          const newLeft = (prev || 0) + deltaX;
          return Math.max(0, Math.min(newLeft, cardWidth - barcodeImageWidth));
        });
        setBarcodeImageMarginTop((prev) => {
          const newTop = (prev || 0) + deltaY;
          return Math.max(0, Math.min(newTop, cardHeight - barcodeImageHeight));
        });
        break;
      }
      case "qrcode": {
          setQrCodeLeft((prev) => {
            const newLeft = (prev || 0) + deltaX;
            return Math.max(0, Math.min(newLeft, cardWidth - qrCodeWidth));
          });
          setQrCodeTop((prev) => {
            const newTop = (prev || 0) + deltaY;
            return Math.max(0, Math.min(newTop, cardHeight - qrCodeHeight));
          });
        break;
      }
      default:
        break;
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(false);
  };

  // Resize handlers
  const handleResizeStart = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(type);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: imageWidth,
      height: imageHeight,
      visitorWidth: visitorNameWidth,
      visitorHeight: visitorNameHeight,
      companyWidth: companyNameWidth,
      companyHeight: companyNameHeight,
      barcodeWidth: barcodeImageWidth,
      barcodeHeight: barcodeImageHeight,
      qrWidth: qrCodeWidth,
      qrHeight: qrCodeHeight,
    });
  };

  const handleResizeMove = (e) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // Card dimensions for boundary constraints
    const cardWidth = 309;
    const cardHeight = 475;

    if (resizing === "image") {
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(50, resizeStart.height + deltaY);
      
      // Ensure image doesn't exceed card boundaries
      const maxWidth = cardWidth - imageLeftMargin;
      const maxHeight = cardHeight - imageTopMargin;
      
      setImageWidth(Math.min(newWidth, maxWidth));
      setImageHeight(Math.min(newHeight, maxHeight));
    } else if (resizing === "visitorName") {
      const newWidth = Math.max(50, resizeStart.visitorWidth + deltaX);
      const newHeight = Math.max(20, resizeStart.visitorHeight + deltaY);
      
      // Ensure visitor name doesn't exceed card boundaries
      const maxWidth = cardWidth - visitorNameMarginLeft;
      const maxHeight = cardHeight - visitorNameMarginTop;
      
      setVisitorNameWidth(Math.min(newWidth, maxWidth));
      setVisitorNameHeight(Math.min(newHeight, maxHeight));
    } else if (resizing === "companyName") {
      const newWidth = Math.max(50, resizeStart.companyWidth + deltaX);
      const newHeight = Math.max(20, resizeStart.companyHeight + deltaY);
      
      // Ensure company name doesn't exceed card boundaries
      const maxWidth = cardWidth - companyNameMarginLeft;
      const maxHeight = cardHeight - companyNameMarginTop;
      
      setCompanyNameWidth(Math.min(newWidth, maxWidth));
      setCompanyNameHeight(Math.min(newHeight, maxHeight));
    } else if (resizing === "barcode") {
      const newWidth = Math.max(50, resizeStart.barcodeWidth + deltaX);
      const newHeight = Math.max(20, resizeStart.barcodeHeight + deltaY);
      
      // Ensure barcode doesn't exceed card boundaries
      const maxWidth = cardWidth - barcodeImageMarginLeft;
      const maxHeight = cardHeight - barcodeImageMarginTop;
      
      setBarcodeImageWidth(Math.min(newWidth, maxWidth));
      setBarcodeImageHeight(Math.min(newHeight, maxHeight));
    } else if (resizing === "qrCode") {
      const newWidth = Math.max(50, resizeStart.qrWidth + deltaX);
      const newHeight = Math.max(50, resizeStart.qrHeight + deltaY);
      
      // Ensure QR code doesn't exceed card boundaries
      const maxWidth = cardWidth - qrCodeLeft;
      const maxHeight = cardHeight - qrCodeTop;
      
      setQrCodeWidth(Math.min(newWidth, maxWidth));
      setQrCodeHeight(Math.min(newHeight, maxHeight));
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, dragStart]);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing, resizeStart]);

  // Handle background image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundUrl(event.target.result);
        toast.success("Background image uploaded!");
      };
      reader.readAsDataURL(file);
      setBackImage(file);
    }
  };

  // Save all settings to backend
  const saveSettings = async () => {
    setSaving(true);

    try {
      // Clamp all values to card bounds
      const cardWidth = 309;
      const cardHeight = 475;
      
      // Clamp image
      const clampedImageWidth = Math.max(10, Math.min(imageWidth, cardWidth));
      const clampedImageHeight = Math.max(10, Math.min(imageHeight, cardHeight));
      const clampedImageMarginLeft = Math.max(0, Math.min(imageLeftMargin, cardWidth - clampedImageWidth));
      const clampedImageMarginTop = Math.max(0, Math.min(imageTopMargin, cardHeight - clampedImageHeight));
      
      // Clamp visitor name
      const clampedVisitorNameWidth = Math.max(10, Math.min(visitorNameWidth, cardWidth));
      const clampedVisitorNameHeight = Math.max(10, Math.min(visitorNameHeight, cardHeight));
      const clampedVisitorNameMarginLeft = Math.max(0, Math.min(visitorNameMarginLeft, cardWidth - clampedVisitorNameWidth));
      const clampedVisitorNameMarginTop = Math.max(0, Math.min(visitorNameMarginTop, cardHeight - clampedVisitorNameHeight));
      
      // Clamp company name
      const clampedCompanyNameWidth = Math.max(10, Math.min(companyNameWidth, cardWidth));
      const clampedCompanyNameHeight = Math.max(10, Math.min(companyNameHeight, cardHeight));
      const clampedCompanyNameMarginLeft = Math.max(0, Math.min(companyNameMarginLeft, cardWidth - clampedCompanyNameWidth));
      const clampedCompanyNameMarginTop = Math.max(0, Math.min(companyNameMarginTop, cardHeight - clampedCompanyNameHeight));
      
      // Clamp barcode
      const clampedBarcodeImageWidth = Math.max(10, Math.min(barcodeImageWidth, cardWidth));
      const clampedBarcodeImageHeight = Math.max(10, Math.min(barcodeImageHeight, cardHeight));
      const clampedBarcodeImageMarginLeft = Math.max(0, Math.min(barcodeImageMarginLeft, cardWidth - clampedBarcodeImageWidth));
      const clampedBarcodeImageMarginTop = Math.max(0, Math.min(barcodeImageMarginTop, cardHeight - clampedBarcodeImageHeight));
      
      // Clamp QR code
      const clampedQrCodeWidth = Math.max(10, Math.min(qrCodeWidth, cardWidth));
      const clampedQrCodeHeight = Math.max(10, Math.min(qrCodeHeight, cardHeight));
      const clampedQrCodeLeft = Math.max(0, Math.min(qrCodeLeft, cardWidth - clampedQrCodeWidth));
      const clampedQrCodeTop = Math.max(0, Math.min(qrCodeTop, cardHeight - clampedQrCodeHeight));

      const settings = {
        imageWidth: clampedImageWidth,
        imageHeight: clampedImageHeight,
        imageTopMargin: clampedImageMarginTop,
        imageBottomMargin: imageBottomMargin,
        imageLeftMargin: clampedImageMarginLeft,
        imageRightMargin: imageRightMargin,
        imageShape,
        bottomContainerWidth,
        bottomContainerHeight,
        bottomContainerTopMargin,
        bottomContainerBottomMargin,
        bottomContainerLeftMargin,
        bottomContainerRightMargin,
        visitorNameWidth: clampedVisitorNameWidth,
        visitorNameHeight: clampedVisitorNameHeight,
        visitorNameFontSize,
        visitorNameMarginTop: clampedVisitorNameMarginTop,
        visitorNameMarginBottom: visitorNameMarginBottom,
        visitorNameMarginRight: visitorNameMarginRight,
        visitorNameMarginLeft: clampedVisitorNameMarginLeft,
        visitorNameColor,
        visitorNameAlign,
        visitorNameFontFamily,
        companyNameWidth: clampedCompanyNameWidth,
        companyNameHeight: clampedCompanyNameHeight,
        companyNameFontSize,
        companyNameMarginTop: clampedCompanyNameMarginTop,
        companyNameMarginBottom: companyNameMarginBottom,
        companyNameMarginRight: companyNameMarginRight,
        companyNameMarginLeft: clampedCompanyNameMarginLeft,
        companyNameColor,
        companyNameAlign,
        companyNameFontFamily,
        barcodeImageWidth: clampedBarcodeImageWidth,
        barcodeImageHeight: clampedBarcodeImageHeight,
        barcodeImageMarginTop: clampedBarcodeImageMarginTop,
        barcodeImageMarginRight,
        barcodeImageMarginBottom,
        barcodeImageMarginLeft: clampedBarcodeImageMarginLeft,
        barcodeType,
        showBarcode,
        qrCodeWidth: clampedQrCodeWidth,
        qrCodeHeight: clampedQrCodeHeight,
        qrCodeTop: clampedQrCodeTop,
        qrCodeLeft: clampedQrCodeLeft,
        showQRCode,
        backgroundUrl,
        printWidth,
        printHeight,
        printUnit,
      };

      console.log("💾 Saving card design settings to backend:", settings);

      // Save to backend
      const response = await settingsAPI.updateCardDesignSettings(settings);
      
      if (response.data.success) {
        console.log("✅ Card design settings saved to backend successfully");
        toast.success("Card design settings saved successfully!");
        
        // Also save to localStorage as backup
        localStorage.setItem("cardDesignSettings", JSON.stringify(settings));
      } else {
        throw new Error(response.data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("❌ Error saving card design settings:", error);
      toast.error("Failed to save card design settings");
      
      // Fallback to localStorage if backend fails
      try {
        const settings = {
          imageWidth: clampedImageWidth,
          imageHeight: clampedImageHeight,
          imageTopMargin: clampedImageMarginTop,
          imageBottomMargin: imageBottomMargin,
          imageLeftMargin: clampedImageMarginLeft,
          imageRightMargin: imageRightMargin,
          imageShape,
          bottomContainerWidth,
          bottomContainerHeight,
          bottomContainerTopMargin,
          bottomContainerBottomMargin,
          bottomContainerLeftMargin,
          bottomContainerRightMargin,
          visitorNameWidth: clampedVisitorNameWidth,
          visitorNameHeight: clampedVisitorNameHeight,
          visitorNameFontSize,
          visitorNameMarginTop: clampedVisitorNameMarginTop,
          visitorNameMarginBottom: visitorNameMarginBottom,
          visitorNameMarginRight: visitorNameMarginRight,
          visitorNameMarginLeft: clampedVisitorNameMarginLeft,
          visitorNameColor,
          visitorNameAlign,
          visitorNameFontFamily,
          companyNameWidth: clampedCompanyNameWidth,
          companyNameHeight: clampedCompanyNameHeight,
          companyNameFontSize,
          companyNameMarginTop: clampedCompanyNameMarginTop,
          companyNameMarginBottom: companyNameMarginBottom,
          companyNameMarginRight: companyNameMarginRight,
          companyNameMarginLeft: clampedCompanyNameMarginLeft,
          companyNameColor,
          companyNameAlign,
          companyNameFontFamily,
          barcodeImageWidth: clampedBarcodeImageWidth,
          barcodeImageHeight: clampedBarcodeImageHeight,
          barcodeImageMarginTop: clampedBarcodeImageMarginTop,
          barcodeImageMarginRight,
          barcodeImageMarginBottom,
          barcodeImageMarginLeft: clampedBarcodeImageMarginLeft,
          barcodeType,
          showBarcode,
          qrCodeWidth: clampedQrCodeWidth,
          qrCodeHeight: clampedQrCodeHeight,
          qrCodeTop: clampedQrCodeTop,
          qrCodeLeft: clampedQrCodeLeft,
          showQRCode,
          backgroundUrl,
          printWidth,
          printHeight,
          printUnit,
        };
        localStorage.setItem("cardDesignSettings", JSON.stringify(settings));
        console.log("💾 Saved to localStorage as fallback");
        toast.success("Settings saved locally as backup");
      } catch (localError) {
        console.error("❌ Failed to save to localStorage:", localError);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Card Designer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize visitor ID card layout and design
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-4">
          {/* Main Card with all essential controls */}
          <Card>
            <CardHeader>
              <CardTitle>Card Design Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Background Image Upload */}
              <div>
                <Label htmlFor="backImage" className="text-base font-semibold">
                  Background Image
                </Label>
                <Input
                  id="backImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-2"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

              {/* Print Size Settings */}
              <div>
                <Label className="text-base font-semibold">Print Size Settings</Label>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label className="text-sm">Width</Label>
                    <Input
                      type="number"
                      value={printWidth}
                      onChange={(e) => setPrintWidth(Number(e.target.value))}
                      className="mt-1"
                      min="50"
                      max="300"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Height</Label>
                    <Input
                      type="number"
                      value={printHeight}
                      onChange={(e) => setPrintHeight(Number(e.target.value))}
                      className="mt-1"
                      min="80"
                      max="400"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Unit</Label>
                    <select
                      value={printUnit}
                      onChange={(e) => setPrintUnit(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="mm">mm</option>
                      <option value="inches">inches</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {printWidth} x {printHeight} {printUnit}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

              {/* Photo Shape */}
              <div>
                <Label className="text-base font-semibold">Photo Shape</Label>
                <select
                  value={imageShape}
                  onChange={(e) => setImageShape(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="circle">Circle (Round)</option>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded Square</option>
                </select>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

              {/* Code Display Options */}
              <div>
                <Label className="text-base font-semibold">
                  Code Display Options
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show Barcode
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showQRCode}
                      onChange={(e) => setShowQRCode(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show QR Code
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

              {/* Save Button */}
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loading
                      size="sm"
                      className="border-white border-t-transparent mr-2"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Save Card Design
                  </>
                )}
              </Button>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

              {/* Advanced Parameters Toggle */}
              <Button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                variant="outline"
                className="w-full"
              >
                {showAdvancedSettings ? "▲ Hide" : "▼ Show"} Advanced Parameters
                (Size & Position)
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Settings - Collapsible */}
          {showAdvancedSettings && (
            <>
              {/* Photo Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>📷 Photo Size & Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Margin Top</Label>
                      <Input
                        type="number"
                        value={imageTopMargin}
                        onChange={(e) =>
                          setImageTopMargin(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Margin Left</Label>
                      <Input
                        type="number"
                        value={imageLeftMargin}
                        onChange={(e) =>
                          setImageLeftMargin(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visitor Name Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>👤 Visitor Name Size & Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        value={visitorNameWidth}
                        onChange={(e) =>
                          setVisitorNameWidth(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={visitorNameHeight}
                        onChange={(e) =>
                          setVisitorNameHeight(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Font Size (px)</Label>
                      <Input
                        type="number"
                        value={visitorNameFontSize}
                        onChange={(e) =>
                          setVisitorNameFontSize(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <ColorPalette
                        currentColor={visitorNameColor}
                        onColorChange={setVisitorNameColor}
                        label="Text Color"
                      />
                    </div>
                    <div>
                      <Label>Margin Top</Label>
                      <Input
                        type="number"
                        value={visitorNameMarginTop}
                        onChange={(e) =>
                          setVisitorNameMarginTop(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Margin Left</Label>
                      <Input
                        type="number"
                        value={visitorNameMarginLeft}
                        onChange={(e) =>
                          setVisitorNameMarginLeft(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">
                        Text Alignment
                      </Label>
                      
                      {/* Dropdown Select List */}
                      <select
                        value={visitorNameAlign}
                        onChange={(e) => handleTextAlignment("visitor", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="center-left">Center Left</option>
                        <option value="center">Center</option>
                        <option value="center-right">Center Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Select text position within the box
                      </p>
                    </div>
                    <div>
                      <Label>Font Family</Label>
                      <select
                        value={visitorNameFontFamily}
                        onChange={(e) =>
                          setVisitorNameFontFamily(e.target.value)
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        style={{ fontFamily: visitorNameFontFamily }}
                      >
                        <option value="Arial" style={{ fontFamily: "Arial" }}>
                          Arial
                        </option>
                        <option
                          value="Times New Roman"
                          style={{ fontFamily: "Times New Roman" }}
                        >
                          Times New Roman
                        </option>
                        <option
                          value="Georgia"
                          style={{ fontFamily: "Georgia" }}
                        >
                          Georgia
                        </option>
                        <option
                          value="Courier New"
                          style={{ fontFamily: "Courier New" }}
                        >
                          Courier New
                        </option>
                        <option
                          value="Verdana"
                          style={{ fontFamily: "Verdana" }}
                        >
                          Verdana
                        </option>
                        <option
                          value="Trebuchet MS"
                          style={{ fontFamily: "Trebuchet MS" }}
                        >
                          Trebuchet MS
                        </option>
                        <option
                          value="Comic Sans MS"
                          style={{ fontFamily: "Comic Sans MS" }}
                        >
                          Comic Sans MS
                        </option>
                        <option value="Impact" style={{ fontFamily: "Impact" }}>
                          Impact
                        </option>
                        <option
                          value="Palatino"
                          style={{ fontFamily: "Palatino" }}
                        >
                          Palatino
                        </option>
                        <option
                          value="Garamond"
                          style={{ fontFamily: "Garamond" }}
                        >
                          Garamond
                        </option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Name Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>🏢 Company Name Size & Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        value={companyNameWidth}
                        onChange={(e) =>
                          setCompanyNameWidth(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={companyNameHeight}
                        onChange={(e) =>
                          setCompanyNameHeight(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Font Size (px)</Label>
                      <Input
                        type="number"
                        value={companyNameFontSize}
                        onChange={(e) =>
                          setCompanyNameFontSize(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <ColorPalette
                        currentColor={companyNameColor}
                        onColorChange={setCompanyNameColor}
                        label="Text Color"
                      />
                    </div>
                    <div>
                      <Label>Margin Top</Label>
                      <Input
                        type="number"
                        value={companyNameMarginTop}
                        onChange={(e) =>
                          setCompanyNameMarginTop(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Margin Left</Label>
                      <Input
                        type="number"
                        value={companyNameMarginLeft}
                        onChange={(e) =>
                          setCompanyNameMarginLeft(Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">
                        Text Alignment
                      </Label>
                      
                      {/* Dropdown Select List */}
                      <select
                        value={companyNameAlign}
                        onChange={(e) => handleTextAlignment("company", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="center-left">Center Left</option>
                        <option value="center">Center</option>
                        <option value="center-right">Center Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Select text position within the box
                      </p>
                    </div>
                    <div>
                      <Label>Font Family</Label>
                      <select
                        value={companyNameFontFamily}
                        onChange={(e) =>
                          setCompanyNameFontFamily(e.target.value)
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        style={{ fontFamily: companyNameFontFamily }}
                      >
                        <option value="Arial" style={{ fontFamily: "Arial" }}>
                          Arial
                        </option>
                        <option
                          value="Times New Roman"
                          style={{ fontFamily: "Times New Roman" }}
                        >
                          Times New Roman
                        </option>
                        <option
                          value="Georgia"
                          style={{ fontFamily: "Georgia" }}
                        >
                          Georgia
                        </option>
                        <option
                          value="Courier New"
                          style={{ fontFamily: "Courier New" }}
                        >
                          Courier New
                        </option>
                        <option
                          value="Verdana"
                          style={{ fontFamily: "Verdana" }}
                        >
                          Verdana
                        </option>
                        <option
                          value="Trebuchet MS"
                          style={{ fontFamily: "Trebuchet MS" }}
                        >
                          Trebuchet MS
                        </option>
                        <option
                          value="Comic Sans MS"
                          style={{ fontFamily: "Comic Sans MS" }}
                        >
                          Comic Sans MS
                        </option>
                        <option value="Impact" style={{ fontFamily: "Impact" }}>
                          Impact
                        </option>
                        <option
                          value="Palatino"
                          style={{ fontFamily: "Palatino" }}
                        >
                          Palatino
                        </option>
                        <option
                          value="Garamond"
                          style={{ fontFamily: "Garamond" }}
                        >
                          Garamond
                        </option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Barcode Settings */}
              {showBarcode && (
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Barcode Size & Position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Width (px)</Label>
                        <Input
                          type="number"
                          value={barcodeImageWidth}
                          onChange={(e) =>
                            setBarcodeImageWidth(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Height (px)</Label>
                        <Input
                          type="number"
                          value={barcodeImageHeight}
                          onChange={(e) =>
                            setBarcodeImageHeight(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Margin Top</Label>
                        <Input
                          type="number"
                          value={barcodeImageMarginTop}
                          onChange={(e) =>
                            setBarcodeImageMarginTop(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Margin Left</Label>
                        <Input
                          type="number"
                          value={barcodeImageMarginLeft}
                          onChange={(e) =>
                            setBarcodeImageMarginLeft(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* QR Code Settings */}
              {showQRCode && (
                <Card>
                  <CardHeader>
                    <CardTitle>📱 QR Code Size & Position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Width (px)</Label>
                        <Input
                          type="number"
                          value={qrCodeWidth}
                          onChange={(e) =>
                            setQrCodeWidth(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Height (px)</Label>
                        <Input
                          type="number"
                          value={qrCodeHeight}
                          onChange={(e) =>
                            setQrCodeHeight(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Top</Label>
                        <Input
                          type="number"
                          value={qrCodeTop}
                          onChange={(e) =>
                            setQrCodeTop(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Left</Label>
                        <Input
                          type="number"
                          value={qrCodeLeft}
                          onChange={(e) =>
                            setQrCodeLeft(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Live Preview - Sticky to stay visible while scrolling */}
        <div className="sticky top-6 self-start">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview (Drag elements to move)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* ...tip removed... */}

              {/* Card Preview */}
              <div
                ref={imageDivRef}
                className="border-2 border-gray-300 rounded-lg mx-auto"
                style={{
                  width: "309px",
                  height: "475px",
                  backgroundImage: backgroundUrl
                    ? `url(${backgroundUrl})`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Photo Box */}
                <div
                  ref={imageBoxRef}
                  onMouseDown={(e) => handleMouseDown(e, "imageBox")}
                  style={{
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    border: "2px solid #39FF14", // Green as requested
                    top: `${imageTopMargin}px`,
                    left: `${imageLeftMargin}px`,
                    cursor: dragging === "imageBox" ? "grabbing" : "grab",
                    position: "absolute",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius:
                      imageShape === "circle"
                        ? "50%"
                        : imageShape === "rounded"
                        ? "12px"
                        : "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: 30,
                  }}
                  title="Drag to move photo"
                >
                  PHOTO
                  {/* Resize Handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, "image")}
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      right: "-4px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#39FF14",
                      border: "2px solid white",
                      borderRadius: "50%",
                      cursor: "nwse-resize",
                      zIndex: 40,
                    }}
                    title="Drag to resize"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Visitor Name */}
                <div
                  ref={visitorNameRef}
                  onMouseDown={(e) => handleMouseDown(e, "visitorName")}
                  className={`absolute whitespace-nowrap overflow-hidden text-ellipsis font-bold border-2 border-yellow-400 bg-yellow-100 bg-opacity-10 p-1 rounded ${getAlignmentClasses(visitorNameAlign)}`}
                  style={{
                    fontSize: `${visitorNameFontSize}px`,
                    top: `${visitorNameMarginTop}px`,
                    left: `${visitorNameMarginLeft}px`,
                    width: `${visitorNameWidth}px`,
                    height: `${visitorNameHeight}px`,
                    cursor: dragging === "visitorName" ? "grabbing" : "grab",
                    color: visitorNameColor,
                    fontFamily: visitorNameFontFamily,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                  title="Drag to move visitor name"
                >
                  {/* Visitor Name Resize Handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, "visitorName")}
                    style={{
                      position: "absolute",
                      bottom: "-5px",
                      right: "5px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "yellow",
                      border: "1px solid black",
                      borderRadius: "50%",
                      cursor: "se-resize",
                      zIndex: 20,
                    }}
                    title="Drag to resize box (width & height)"
                    onClick={(e) => e.stopPropagation()}
                  />
                  Visitor Name
                </div>

                {/* Company Name */}
                <div
                  ref={companyNameRef}
                  onMouseDown={(e) => handleMouseDown(e, "companyName")}
                  className={`absolute whitespace-nowrap overflow-hidden text-ellipsis border-2 border-orange-400 bg-orange-100 bg-opacity-10 p-1 rounded ${getAlignmentClasses(companyNameAlign)}`}
                  style={{
                    fontSize: `${companyNameFontSize}px`,
                    top: `${companyNameMarginTop}px`,
                    left: `${companyNameMarginLeft}px`,
                    width: `${companyNameWidth}px`,
                    height: `${companyNameHeight}px`,
                    cursor: dragging === "companyName" ? "grabbing" : "grab",
                    color: companyNameColor,
                    fontFamily: companyNameFontFamily,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                  title="Drag to move company name"
                >
                  {/* Company Name Resize Handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, "companyName")}
                    style={{
                      position: "absolute",
                      bottom: "-5px",
                      right: "5px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "orange",
                      border: "1px solid black",
                      borderRadius: "50%",
                      cursor: "se-resize",
                      zIndex: 20,
                    }}
                    title="Drag to resize box (width & height)"
                    onClick={(e) => e.stopPropagation()}
                  />
                  Company Name
                </div>

                {/* Barcode */}
                {showBarcode && (
                  <div
                    ref={barcodeRef}
                    onMouseDown={(e) => handleMouseDown(e, "barcode")}
                    style={{
                      width: `${barcodeImageWidth}px`,
                      height: `${barcodeImageHeight}px`,
                      top: `${barcodeImageMarginTop}px`,
                      left: `${barcodeImageMarginLeft}px`,
                      cursor: dragging === "barcode" ? "grabbing" : "grab",
                      position: "absolute",
                      border: "2px solid rgb(43, 20, 255)",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#000000",
                      zIndex: 25,
                    }}
                    title="Drag to move barcode"
                  >
                    BARCODE
                    {/* Barcode Resize Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, "barcode")}
                      style={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "-4px",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "blue",
                        border: "1px solid white",
                        borderRadius: "50%",
                        cursor: "nwse-resize",
                        zIndex: 30,
                      }}
                      title="Drag to resize barcode"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* QR Code */}
                {showQRCode && (
                  <div
                    onMouseDown={(e) => handleMouseDown(e, "qrcode")}
                    style={{
                      width: `${qrCodeWidth}px`,
                      height: `${qrCodeHeight}px`,
                      top: `${qrCodeTop}px`,
                      left: `${qrCodeLeft}px`,
                      cursor: dragging === "qrcode" ? "grabbing" : "grab",
                      position: "absolute",
                      border: "2px solid rgb(255, 0, 255)",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      zIndex: 20,
                    }}
                    title="Drag to move QR code"
                  >
                    QR CODE
                    {/* QR Code Resize Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, "qrCode")}
                      style={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "-4px",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "pink",
                        border: "1px solid black",
                        borderRadius: "50%",
                        cursor: "nwse-resize",
                        zIndex: 30,
                      }}
                      title="Drag to resize QR code"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>

              {/* ...legend removed... */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardDesigner;
