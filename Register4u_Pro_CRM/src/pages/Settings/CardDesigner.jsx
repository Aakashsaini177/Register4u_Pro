import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { CheckCircleIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const CardDesigner = () => {

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
  const [qrCodeMarginTop, setQrCodeMarginTop] = useState(10);
  const [qrCodeMarginLeft, setQrCodeMarginLeft] = useState(50);
  const [showQRCode, setShowQRCode] = useState(false);

  // Background image
  const [backImage, setBackImage] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Advanced settings toggle
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cardDesignSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      setImageWidth(settings.imageWidth || 100);
      setImageHeight(settings.imageHeight || 100);
      setImageTopMargin(settings.imageTopMargin || 20);
      setImageBottomMargin(settings.imageBottomMargin || 0);
      setImageLeftMargin(settings.imageLeftMargin || 20);
      setImageRightMargin(settings.imageRightMargin || 0);
      setImageShape(settings.imageShape || "circle");

      setBottomContainerWidth(settings.bottomContainerWidth || 250);
      setBottomContainerHeight(settings.bottomContainerHeight || 150);
      setBottomContainerTopMargin(settings.bottomContainerTopMargin || 10);
      setBottomContainerBottomMargin(settings.bottomContainerBottomMargin || 0);
      setBottomContainerLeftMargin(settings.bottomContainerLeftMargin || 30);
      setBottomContainerRightMargin(settings.bottomContainerRightMargin || 0);

      setVisitorNameWidth(settings.visitorNameWidth || 200);
      setVisitorNameHeight(settings.visitorNameHeight || 30);
      setVisitorNameFontSize(settings.visitorNameFontSize || 18);
      setVisitorNameMarginTop(settings.visitorNameMarginTop || 140);
      setVisitorNameMarginBottom(settings.visitorNameMarginBottom || 0);
      setVisitorNameMarginRight(settings.visitorNameMarginRight || 0);
      setVisitorNameMarginLeft(settings.visitorNameMarginLeft || 20);
      setVisitorNameColor(settings.visitorNameColor || "#FFFFFF");
      setVisitorNameAlign(settings.visitorNameAlign || "left");
      setVisitorNameFontFamily(settings.visitorNameFontFamily || "Arial");

      setCompanyNameWidth(settings.companyNameWidth || 200);
      setCompanyNameHeight(settings.companyNameHeight || 25);
      setCompanyNameFontSize(settings.companyNameFontSize || 14);
      setCompanyNameMarginTop(settings.companyNameMarginTop || 170);
      setCompanyNameMarginBottom(settings.companyNameMarginBottom || 0);
      setCompanyNameMarginRight(settings.companyNameMarginRight || 0);
      setCompanyNameMarginLeft(settings.companyNameMarginLeft || 20);
      setCompanyNameColor(settings.companyNameColor || "#FFFFFF");
      setCompanyNameAlign(settings.companyNameAlign || "left");
      setCompanyNameFontFamily(settings.companyNameFontFamily || "Arial");

      setBarcodeImageWidth(settings.barcodeImageWidth || 200);
      setBarcodeImageHeight(settings.barcodeImageHeight || 60);
      setBarcodeImageMarginTop(settings.barcodeImageMarginTop || 10);
      setBarcodeImageMarginRight(settings.barcodeImageMarginRight || 0);
      setBarcodeImageMarginBottom(settings.barcodeImageMarginBottom || 10);
      setBarcodeImageMarginLeft(settings.barcodeImageMarginLeft || 25);
      setBarcodeType(settings.barcodeType || "barcode");
      setShowBarcode(
        settings.showBarcode !== undefined ? settings.showBarcode : true
      );

      setQrCodeWidth(settings.qrCodeWidth || 100);
      setQrCodeHeight(settings.qrCodeHeight || 100);
      setQrCodeMarginTop(settings.qrCodeMarginTop || 10);
      setQrCodeMarginLeft(settings.qrCodeMarginLeft || 50);
      setShowQRCode(
        settings.showQRCode !== undefined ? settings.showQRCode : false
      );

      if (settings.backgroundUrl) {
        setBackgroundUrl(settings.backgroundUrl);
      }
    }
  }, []);

  // Text Alignment Handler (only changes text alignment, not box position)
  const handleTextAlignment = (type, alignment) => {
    // Parse alignment value (e.g., "top-left" -> vertical: "top", horizontal: "left")
    const [vertical, horizontal] = alignment.split('-');
    
    // Convert to CSS text-align values
    let textAlign = "left";
    if (horizontal === "center") {
      textAlign = "center";
    } else if (horizontal === "right") {
      textAlign = "right";
    }
    
    // For now, we'll just handle horizontal alignment
    // Vertical alignment within the box can be handled with CSS later if needed
    if (type === "visitor") {
      setVisitorNameAlign(textAlign);
    } else if (type === "company") {
      setCompanyNameAlign(textAlign);
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

    switch (dragging) {
      case "imageBox":
        setImageLeftMargin((prev) => (prev || 0) + deltaX);
        setImageTopMargin((prev) => (prev || 0) + deltaY);
        break;
      case "visitorName":
        setVisitorNameMarginLeft((prev) => (prev || 0) + deltaX);
        setVisitorNameMarginTop((prev) => (prev || 0) + deltaY);
        break;
      case "companyName":
        setCompanyNameMarginLeft((prev) => (prev || 0) + deltaX);
        setCompanyNameMarginTop((prev) => (prev || 0) + deltaY);
        break;
      case "barcode":
        setBarcodeImageMarginLeft((prev) => (prev || 0) + deltaX);
        setBarcodeImageMarginTop((prev) => (prev || 0) + deltaY);
        break;
      case "qrcode":
        setQrCodeMarginLeft((prev) => (prev || 0) + deltaX);
        setQrCodeMarginTop((prev) => (prev || 0) + deltaY);
        break;
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

    if (resizing === "image") {
      setImageWidth(Math.max(50, resizeStart.width + deltaX));
      setImageHeight(Math.max(50, resizeStart.height + deltaY));
    } else if (resizing === "visitorName") {
      // Resize the box width and height like barcode
      setVisitorNameWidth(Math.max(50, resizeStart.visitorWidth + deltaX));
      setVisitorNameHeight(Math.max(20, resizeStart.visitorHeight + deltaY));
    } else if (resizing === "companyName") {
      // Resize the box width and height like barcode
      setCompanyNameWidth(Math.max(50, resizeStart.companyWidth + deltaX));
      setCompanyNameHeight(Math.max(20, resizeStart.companyHeight + deltaY));
    } else if (resizing === "barcode") {
      setBarcodeImageWidth(Math.max(50, resizeStart.barcodeWidth + deltaX));
      setBarcodeImageHeight(Math.max(20, resizeStart.barcodeHeight + deltaY));
    } else if (resizing === "qrCode") {
      // QR usually square, but we allow free resize or keep aspect?
      // User said "Drag corner to resize", implying free or square.
      // Let's allow free for now as variables are separate width/height.
      setQrCodeWidth(Math.max(50, resizeStart.qrWidth + deltaX));
      setQrCodeHeight(Math.max(50, resizeStart.qrHeight + deltaY));
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

  // Save all settings
  const saveSettings = () => {
    setSaving(true);

    const settings = {
      imageWidth,
      imageHeight,
      imageTopMargin,
      imageBottomMargin,
      imageLeftMargin,
      imageRightMargin,
      imageShape,
      bottomContainerWidth,
      bottomContainerHeight,
      bottomContainerTopMargin,
      bottomContainerBottomMargin,
      bottomContainerLeftMargin,
      bottomContainerRightMargin,
      visitorNameWidth,
      visitorNameHeight,
      visitorNameFontSize,
      visitorNameMarginTop,
      visitorNameMarginBottom,
      visitorNameMarginRight,
      visitorNameMarginLeft,
      visitorNameColor,
      visitorNameAlign,
      visitorNameFontFamily,
      companyNameWidth,
      companyNameHeight,
      companyNameFontSize,
      companyNameMarginTop,
      companyNameMarginBottom,
      companyNameMarginRight,
      companyNameMarginLeft,
      companyNameColor,
      companyNameAlign,
      companyNameFontFamily,
      barcodeImageWidth,
      barcodeImageHeight,
      barcodeImageMarginTop,
      barcodeImageMarginRight,
      barcodeImageMarginBottom,
      barcodeImageMarginLeft,
      barcodeType,
      showBarcode,
      qrCodeWidth,
      qrCodeHeight,
      qrCodeMarginTop,
      qrCodeMarginLeft,
      showQRCode,
      backgroundUrl,
    };

    // Save to localStorage
    localStorage.setItem("cardDesignSettings", JSON.stringify(settings));

    // You can also save to backend API here
    // await settingsAPI.save(settings)

    setTimeout(() => {
      setSaving(false);
      toast.success("Card design settings saved!");
    }, 500);
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
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={visitorNameColor}
                          onChange={(e) => setVisitorNameColor(e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={visitorNameColor}
                          onChange={(e) => setVisitorNameColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
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
                      <select
                        value={visitorNameAlign}
                        onChange={(e) => handleTextAlignment("visitor", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="middle-left">Middle Left</option>
                        <option value="middle-center">Middle Center</option>
                        <option value="middle-right">Middle Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Drag the yellow box above to position it, then use this to align text inside the box
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
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={companyNameColor}
                          onChange={(e) => setCompanyNameColor(e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={companyNameColor}
                          onChange={(e) => setCompanyNameColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
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
                      <select
                        value={companyNameAlign}
                        onChange={(e) => handleTextAlignment("company", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="middle-left">Middle Left</option>
                        <option value="middle-center">Middle Center</option>
                        <option value="middle-right">Middle Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Drag the orange box above to position it, then use this to align text inside the box
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
                        <Label>Margin Top</Label>
                        <Input
                          type="number"
                          value={qrCodeMarginTop}
                          onChange={(e) =>
                            setQrCodeMarginTop(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Margin Left</Label>
                        <Input
                          type="number"
                          value={qrCodeMarginLeft}
                          onChange={(e) =>
                            setQrCodeMarginLeft(Number(e.target.value))
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
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-900">
                <strong>💡 Tip:</strong> Click and drag any colored box or text
                to reposition it on the card!
              </div>

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
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    border: "2px solid #39FF14", // Green as requested
                    marginTop: `${imageTopMargin}px`,
                    marginLeft: `${imageLeftMargin}px`,
                    cursor: dragging === "imageBox" ? "grabbing" : "grab",
                    position: "relative",
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
                      zIndex: 10,
                    }}
                    title="Drag to resize"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Visitor Name */}
                <div
                  ref={visitorNameRef}
                  onMouseDown={(e) => handleMouseDown(e, "visitorName")}
                  style={{
                    fontSize: `${visitorNameFontSize}px`,
                    top: `${visitorNameMarginTop}px`,
                    left: `${visitorNameMarginLeft}px`,
                    width: `${visitorNameWidth}px`,
                    height: `${visitorNameHeight}px`,
                    textAlign: visitorNameAlign,
                    cursor: dragging === "visitorName" ? "grabbing" : "grab",
                    position: "absolute",
                    color: visitorNameColor,
                    fontWeight: "bold",
                    fontFamily: visitorNameFontFamily,
                    border: "2px solid #FFFF00", // Bright yellow border like image shows
                    backgroundColor: "rgba(255, 255, 0, 0.1)", // Light yellow background
                    padding: "2px 4px",
                    borderRadius: "2px",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center", // Vertical center by default
                    justifyContent: visitorNameAlign === "center" ? "center" : visitorNameAlign === "right" ? "flex-end" : "flex-start",
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
                  style={{
                    fontSize: `${companyNameFontSize}px`,
                    top: `${companyNameMarginTop}px`,
                    left: `${companyNameMarginLeft}px`,
                    width: `${companyNameWidth}px`,
                    height: `${companyNameHeight}px`,
                    textAlign: companyNameAlign,
                    cursor: dragging === "companyName" ? "grabbing" : "grab",
                    position: "absolute",
                    color: companyNameColor,
                    fontFamily: companyNameFontFamily,
                    border: "2px solid #FFA500", // Bright orange border like image shows
                    backgroundColor: "rgba(255, 165, 0, 0.1)", // Light orange background
                    padding: "2px 4px",
                    borderRadius: "2px",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center", // Vertical center by default
                    justifyContent: companyNameAlign === "center" ? "center" : companyNameAlign === "right" ? "flex-end" : "flex-start",
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
                      marginTop: `${barcodeImageMarginTop}px`,
                      marginLeft: `${barcodeImageMarginLeft}px`,
                      cursor: dragging === "barcode" ? "grabbing" : "grab",
                      position: "absolute", // Changed to absolute for proper positioning
                      border: "2px solid rgb(43, 20, 255)",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
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
                        zIndex: 20,
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
                      marginTop: `${qrCodeMarginTop}px`,
                      marginLeft: `${qrCodeMarginLeft}px`,
                      cursor: dragging === "qrcode" ? "grabbing" : "grab",
                      position: "absolute", // Changed to absolute for proper positioning
                      border: "2px solid rgb(255, 0, 255)",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
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
                        zIndex: 20,
                      }}
                      title="Drag to resize QR code"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>
                  <span className="inline-block w-4 h-4 bg-green-400 border-2 border-green-500 mr-2"></span>
                  Photo area (Green) - {imageShape} - Drag corner to resize
                </p>
                <p>
                  <span className="inline-block w-4 h-4 bg-yellow-200 border border-yellow-400 mr-2"></span>
                  Visitor name (Yellow border) - Drag to move
                </p>
                <p>
                  <span className="inline-block w-4 h-4 bg-orange-200 border border-orange-400 mr-2"></span>
                  Company name (Orange border) - Drag to move
                </p>
                {showBarcode && (
                  <p>
                    <span className="inline-block w-4 h-4 bg-blue-200 border-2 border-blue-500 mr-2"></span>
                    Barcode (Blue border) - Drag to move
                  </p>
                )}
                {showQRCode && (
                  <p>
                    <span className="inline-block w-4 h-4 bg-pink-200 border-2 border-pink-500 mr-2"></span>
                    QR Code (Pink border) - Drag to move
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardDesigner;
