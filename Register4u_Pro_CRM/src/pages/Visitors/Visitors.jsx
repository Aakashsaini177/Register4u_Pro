import React, { useEffect, useState, useRef } from "react";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { fileManagerAPI } from "@/lib/fileManagerAPI";
import { Link } from "react-router-dom";
import {
  visitorAPI,
  categoryAPI,
  getImageUrl,
  getPhotoFromFileManager,
  authAPI,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { TableSkeleton, PageLoading } from "@/components/ui/Loading";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import toast from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon, // Added
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  BanknotesIcon,
  PrinterIcon, // Added for print ID card
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";
import { highlightText } from "@/lib/highlightUtils.jsx";

// Utility function to resolve photo URL
const resolvePhotoUrl = (photoFilename, fileManagerPhotos) => {
  if (!photoFilename) return null;

  // Use the new getImageUrl helper for consistent URL construction
  return getImageUrl(photoFilename);
};
import { Checkbox } from "@/components/ui/Checkbox";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import ImportVisitorsModal from "@/components/visitors/ImportVisitorsModal";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [categories, setCategories] = useState({}); // Store as map for easy lookup
  const [loading, withMinimumLoading] = useMinimumLoading(600);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Added
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fileManagerPhotos, setFileManagerPhotos] = useState({}); // Cache for file manager photos

  // Selection State
  const [selectedVisitors, setSelectedVisitors] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // Load saved items per page from localStorage
    try {
      const saved = localStorage.getItem("visitor_items_per_page");
      if (saved === "all") {
        return 999999; // Will be updated when visitors load
      }
      return saved ? parseInt(saved) : 10;
    } catch (e) {
      return 10;
    }
  });

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomTimeoutRef = useRef(null);

  // Photo Popup State
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Load User Preferences on Mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.data.success && response.data.data.preferences) {
          const savedZoom = response.data.data.preferences.zoomLevel;
          if (savedZoom) {
            setZoomLevel(savedZoom);
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences", error);
      }
    };
    loadPreferences();
  }, []);

  // Save Zoom Preference (Debounced)
  const saveZoomPreference = (newZoom) => {
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    zoomTimeoutRef.current = setTimeout(async () => {
      try {
        await authAPI.updatePreferences({
          preferences: { zoomLevel: newZoom },
        });
      } catch (error) {
        console.error("Failed to save zoom preference", error);
      }
    }, 1000);
  };

  const updateZoom = (val) => {
    setZoomLevel((prev) => {
      let newZoom;
      if (typeof val === "function") {
        newZoom = val(prev);
      } else {
        newZoom = val;
      }

      const clamped = Math.min(Math.max(0.5, newZoom), 1.0);
      const rounded = Number(clamped.toFixed(2));

      saveZoomPreference(rounded);
      return rounded;
    });
  };

  // Column Visibility State

  const availableColumns = [
    { key: "sNo", label: "S.No" },
    { key: "photo", label: "Photo" },
    { key: "visitorId", label: "Visitor ID" },
    { key: "payment", label: "Payment Details" },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "category", label: "Category" },
    { key: "city", label: "City" },
    { key: "gender", label: "Gender" },
    { key: "profession", label: "Profession" },
  ];

  // Default persistent state
  const STORAGE_KEY = "visitor_visible_columns";

  const [visibleColumns, setVisibleColumns] = useState(() => {
    // Try to load from local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load column settings", e);
    }
    // Default fallback
    return {
      sNo: true,
      photo: true,
      visitorId: true,
      payment: true,
      name: true,
      company: true,
      contact: true,
      email: true,
      category: true,
      city: true,
      gender: false,
      profession: false,
    };
  });

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef(null);

  // Derived visibility based on zoom
  const isZoomedOut = zoomLevel < 0.95;
  const shouldShow = (key) => {
    // 1. At 100% (or near it), only show what the user selected.
    if (zoomLevel >= 0.95) {
      return visibleColumns[key];
    }

    // 2. At 50% (or less), show EVERYTHING.
    if (zoomLevel <= 0.55) {
      return true;
    }

    // 3. In between 100% and 50%: Progressive Reveal
    // If it's already selected, always show it.
    if (visibleColumns[key]) return true;

    // Determine priority for hidden columns to appear.
    // We'll use the index in availableColumns as priority.
    // Logic: As zoom goes from 1.0 -> 0.5, 'progress' goes 0 -> 1.
    const progress = (1.0 - zoomLevel) / 0.45; // 0.45 is range (0.95 - 0.5)

    // Get list of currently hidden columns
    const hiddenKeys = availableColumns
      .filter((col) => !visibleColumns[col.key])
      .map((col) => col.key);

    const hiddenCount = hiddenKeys.length;
    if (hiddenCount === 0) return true;

    // Calculate how many hidden columns to show based on progress
    const itemsToShow = Math.floor(progress * hiddenCount);

    // Show the first N hidden columns
    const revealedKeys = hiddenKeys.slice(0, itemsToShow);
    return revealedKeys.includes(key);
  };

  // Close column menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(event.target)
      ) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [columnMenuRef]);

  // Refresh on mount and when returning to page
  useEffect(() => {
    fetchVisitors();
    fetchCategories();
    fetchFileManagerPhotos();

    // Ensure file manager defaults are seeded
    const ensureFileManagerSetup = async () => {
      try {
        const { fileManagerAPI } = await import("@/lib/fileManagerAPI");
        await fileManagerAPI.seed();
        console.log("📁 File Manager defaults ensured");
      } catch (error) {
        console.log("📁 File Manager setup skipped (might already exist)");
      }
    };
    ensureFileManagerSetup();
  }, [currentPage, searchTerm, refreshKey]);

  // Also refresh when component mounts (coming back from edit/add)
  useEffect(() => {
    console.log("📋 Visitors component mounted - fetching latest data...");
    setRefreshKey((prev) => prev + 1);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        // Create a map: { id: name }
        const catMap = {};
        (response.data.data || []).forEach((cat) => {
          catMap[cat.id] = cat.name || cat.category;
          // Also map by _id just in case
          if (cat._id) catMap[cat._id] = cat.name || cat.category;
        });
        setCategories(catMap);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchFileManagerPhotos = async () => {
    try {
      console.log("📸 Fetching file manager photos...");

      const photosResponse = await fileManagerAPI.getPhotosFromPhotoFolder();

      if (photosResponse.data.success) {
        const photos = photosResponse.data.data;
        const photoMap = {};

        photos.forEach((photo) => {
          // Map by filename without extension and with extension
          const nameWithoutExt = photo.name.replace(/\.[^/.]+$/, "");
          photoMap[photo.name] = photo.url;
          photoMap[nameWithoutExt] = photo.url;

          console.log(`📸 Mapped photo: ${photo.name} -> ${photo.url}`);
        });

        setFileManagerPhotos(photoMap);
        console.log(
          `📸 Total photos mapped: ${Object.keys(photoMap).length / 2}`,
          photoMap
        );
      } else {
        console.log("📸 No photos found in file manager photo folder");
      }
    } catch (error) {
      console.error("❌ Failed to fetch file manager photos:", error);
      // Set empty object to prevent repeated failed attempts
      setFileManagerPhotos({});
    }
  };

  const fetchVisitors = async () => {
    await withMinimumLoading(async () => {
      // Add timestamp to prevent caching
      const response = await visitorAPI.getAll({
        search: searchTerm,
        _t: Date.now(),
      });
      console.log("Visitors Response:", response.data);

      if (response.data.success) {
        const allVisitors = response.data.data || [];
        setVisitors(allVisitors); // Save ALL visitors
        setInitialLoad(false);
      }
    }).catch((error) => {
      console.error("Visitors Error:", error);
      toast.error("Failed to fetch visitors");
      setInitialLoad(false);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await visitorAPI.delete(id);
      if (response.data.success) {
        toast.success("Visitor deleted successfully");
        fetchVisitors();
      }
    } catch (error) {
      toast.error("Failed to delete visitor");
    }
  };

  const handlePrintCard = (visitor) => {
    // Open ID card page in new tab for printing
    const cardUrl = `/visitors/card/${visitor.visitorId || visitor.id || visitor._id}`;
    window.open(cardUrl, '_blank');
  };

  const handlePhotoClick = (visitor) => {
    // Get the best available photo URL
    const photoUrl = 
      fileManagerPhotos[visitor.photo] ||
      fileManagerPhotos[visitor.photo?.replace(/\.[^/.]+$/, "")] ||
      fileManagerPhotos[visitor.visitorId || visitor.id] ||
      (visitor.photo ? getImageUrl(visitor.photo) : null);
    
    if (photoUrl) {
      setSelectedPhoto({
        url: photoUrl,
        name: visitor.name,
        visitorId: visitor.visitorId || visitor.id
      });
      setShowPhotoModal(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVisitors.length === 0) return;
    if (!window.confirm(`Delete ${selectedVisitors.length} visitors?`)) return;

    let successCount = 0;
    try {
      // Execute deletions sequentially to avoid backend race conditions and potential partial failures
      // This is safer than Promise.all if the backend doesn't support bulk deletion natively
      for (const id of selectedVisitors) {
        try {
          await visitorAPI.delete(id);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete visitor ${id}`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Deleted ${successCount} visitors`);
        setSelectedVisitors([]); // Optimistic clear or could filter out failed ones
        fetchVisitors();
      }

      if (successCount < selectedVisitors.length) {
        toast.error(
          `Failed to delete ${selectedVisitors.length - successCount} visitors`
        );
      }
    } catch (error) {
      toast.error("An error occurred during bulk delete");
    }
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      // Select all IDs in current view (or all if showAll is true)
      const visibleIds = (
        showAll
          ? visitors
          : visitors.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )
      ).map((v) => v._id || v.id);
      setSelectedVisitors((prev) => [...new Set([...prev, ...visibleIds])]);
    } else {
      // Deselect visible? Or deselect all? Convention varies.
      // Let's Deselect All for simplicity
      setSelectedVisitors([]);
    }
  };

  const toggleSelectOne = (id, checked) => {
    setSelectedVisitors((prev) =>
      checked ? [...prev, id] : prev.filter((vid) => vid !== id)
    );
  };

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tableContainerRef = useRef(null);

  // Native Wheel Listener for Stepped Zoom (Stable)
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    let scrollAccumulator = 0;
    const SCROLL_THRESHOLD = 1; // Lowered threshold significantly

    const handleWheelNative = (e) => {
      // DEBUG: Uncomment to see what your trackpad is sending
      // console.log("Wheel:", e.deltaY, "Ctrl:", e.ctrlKey, "Meta:", e.metaKey);

      // Check for Ctrl key (Pinch zoom)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        scrollAccumulator += e.deltaY;

        if (Math.abs(scrollAccumulator) > SCROLL_THRESHOLD) {
          const direction = scrollAccumulator > 0 ? -1 : 1;
          const step = 0.02; // Fine control

          // Use updateZoom wrapper
          updateZoom((prev) => prev + direction * step);

          scrollAccumulator = 0;
        }
      }
    };

    container.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, [loading, initialLoad, visitors.length]);

  // Zoom Handlers (Button based)
  const handleZoomIn = () => updateZoom((prev) => prev + 0.1);
  const handleZoomOut = () => updateZoom((prev) => prev - 0.1);
  const handleResetZoom = () => updateZoom(1.0);

  // Format registration source for display
  const formatRegistrationSource = (source) => {
    const sourceMap = {
      ADMIN_PANEL: "Admin Panel",
      INVITE_LINK: "Invite Link",
      PUBLIC_FORM: "Public Form",
      KIOSK: "Kiosk",
      BULK_IMPORT: "Bulk Import",
    };
    return sourceMap[source] || source;
  };

  // Track if "All" is selected
  const [showAll, setShowAll] = useState(() => {
    return localStorage.getItem("visitor_items_per_page") === "all";
  });

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    if (value === "all") {
      setShowAll(true);
      setItemsPerPage(visitors.length || 999999); // Large number if no visitors yet
      localStorage.setItem("visitor_items_per_page", "all");
    } else {
      setShowAll(false);
      const newItemsPerPage = parseInt(value);
      setItemsPerPage(newItemsPerPage);
      localStorage.setItem("visitor_items_per_page", value);
    }
    setCurrentPage(1); // Reset to first page
  };

  // Initialize showAll state from localStorage
  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem("visitor_items_per_page");
    if (savedItemsPerPage === "all") {
      setShowAll(true);
      setItemsPerPage(visitors.length || 999999);
    }
  }, [visitors.length]);

  // Show full page loader on initial load
  if (loading && initialLoad) {
    return <PageLoading />;
  }

  const handleExport = async () => {
    try {
      const toastId = toast.loading("Exporting visitors...");
      const response = await visitorAPI.export({});

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Visitors_Export_${Date.now()}.xlsx`); // or get filename from header
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Export complete", { id: toastId });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export excel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Visitors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your visitors
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Import
          </Button>

          {selectedVisitors.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <TrashIcon className="h-5 w-5" />
              Delete ({selectedVisitors.length})
            </Button>
          )}

          <Link to="/visitors/add">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Add Visitor
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search visitors..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Visitor List</CardTitle>
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                >
                  <MagnifyingGlassMinusIcon className="h-4 w-4" />
                </button>
                <span
                  className="text-xs font-mono w-10 text-center"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  style={{ cursor: "pointer" }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                >
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Column Toggle Button */}
              <div className="relative" ref={columnMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-8"
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Columns
                </Button>
                {showColumnMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-2">
                    <div className="mb-2 px-2 py-1 text-sm font-semibold text-gray-500">
                      Visible Columns
                    </div>
                    <div className="space-y-1">
                      {availableColumns.map((col) => (
                        <div
                          key={col.key}
                          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                          onClick={() => toggleColumn(col.key)}
                        >
                          <Checkbox
                            checked={visibleColumns[col.key]}
                            onCheckedChange={() => toggleColumn(col.key)}
                          />
                          <span className="text-sm">{col.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Zoom Container Wrapper */}
          <div
            ref={tableContainerRef}
            className="w-full overflow-auto" // Removed touch-none to allow default gesture handling
            style={{ height: "calc(100vh - 300px)" }} // Fixed height to prevent layout shifts
          >
            {loading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : visitors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No visitors found
                </p>
                <Link to="/visitors/add">
                  <Button className="mt-4">Add your first visitor</Button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  zoom: zoomLevel,
                  transition: "zoom 0.1s ease-out", // Faster transition
                  minWidth: "100%", // Ensure it fills width
                }}
                className="origin-top-left"
              >
                <Table wrapperClassName="overflow-visible">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            visitors.length > 0 &&
                            (showAll
                              ? visitors
                              : visitors.slice(
                                  (currentPage - 1) * itemsPerPage,
                                  currentPage * itemsPerPage
                                )
                            ).every((v) =>
                              selectedVisitors.includes(v._id || v.id)
                            )
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>

                      {/* Requested Sequence: S.No, Photo, ID, Payment, Name, Company, Contact, Email, Category, City, Source, Action */}

                      {shouldShow("sNo") && (
                        <TableHead className="whitespace-nowrap w-10 h-8 px-1 text-[11px]">
                          S.No
                        </TableHead>
                      )}

                      {shouldShow("photo") && (
                        <TableHead className="whitespace-nowrap w-10 text-center h-8 px-1 text-[11px]">
                          Photo
                        </TableHead>
                      )}

                      {shouldShow("visitorId") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          ID
                        </TableHead>
                      )}

                      {shouldShow("payment") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          Payment
                        </TableHead>
                      )}

                      {shouldShow("name") && (
                        <TableHead className="min-w-[120px] h-8 px-1 text-[11px]">
                          Name
                        </TableHead>
                      )}

                      {shouldShow("company") && (
                        <TableHead className="min-w-[120px] h-8 px-1 text-[11px]">
                          Company Name
                        </TableHead>
                      )}

                      {shouldShow("contact") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          Contact
                        </TableHead>
                      )}

                      {shouldShow("email") && (
                        <TableHead className="h-8 px-1 text-[11px]">
                          Email
                        </TableHead>
                      )}

                      {shouldShow("category") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          Category
                        </TableHead>
                      )}

                      {shouldShow("city") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          City
                        </TableHead>
                      )}

                      {/* Additional columns available but not in main sequence by default */}

                      {shouldShow("gender") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          Gender
                        </TableHead>
                      )}

                      {shouldShow("profession") && (
                        <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                          Profession
                        </TableHead>
                      )}

                      {/* Source column hidden - kept in backend for history tracking */}
                      {/* 
                      <TableHead className="whitespace-nowrap h-8 px-1 text-[11px]">
                        Source
                      </TableHead>
                      */}

                      <TableHead className="text-center whitespace-nowrap h-8 px-1 text-[11px]">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(showAll
                      ? visitors
                      : visitors.slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage
                        )
                    ).map((visitor, index) => (
                      <TableRow
                        key={visitor._id || visitor.id}
                        className={
                          selectedVisitors.includes(visitor.id)
                            ? "bg-blue-50/50"
                            : ""
                        }
                      >
                        <TableCell className="p-1">
                          <Checkbox
                            checked={selectedVisitors.includes(
                              visitor.id || visitor._id
                            )}
                            onCheckedChange={(checked) =>
                              toggleSelectOne(
                                visitor.id || visitor._id,
                                checked
                              )
                            }
                          />
                        </TableCell>

                        {/* S.No */}
                        {shouldShow("sNo") && (
                          <TableCell className="whitespace-nowrap text-[11px] p-1">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                        )}

                        {/* Photo */}
                        {shouldShow("photo") && (
                          <TableCell className="p-1">
                            <div 
                              className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all duration-200"
                              onClick={() => handlePhotoClick(visitor)}
                              title="Click to view full image"
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
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                          </TableCell>
                        )}

                        {/* Visitor ID */}
                        {shouldShow("visitorId") && (
                          <TableCell className="whitespace-nowrap text-[11px] p-1">
                            <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                              #{highlightText(visitor.visitorId || visitor.id, searchTerm)}
                            </span>
                          </TableCell>
                        )}

                        {/* Payment */}
                        {shouldShow("payment") && (
                          <TableCell className="text-[11px] p-1">
                            {visitor.paymentDetails &&
                            visitor.paymentDetails.amount > 0 ? (
                              <div className="relative group flex items-center">
                                <BanknotesIcon className="h-4 w-4 text-green-600 cursor-pointer" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-gray-900 text-white text-[10px] rounded py-1 px-2 z-10 shadow-lg">
                                  <div className="font-semibold">
                                    Amount: ₹{visitor.paymentDetails.amount}
                                  </div>
                                  <div className="text-gray-300">
                                    Receipt: #
                                    {visitor.paymentDetails.receiptNo || "N/A"}
                                  </div>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        )}

                        {/* Name - Full Show */}
                        {shouldShow("name") && (
                          <TableCell className="font-medium text-[11px] p-1">
                            <span title={visitor.name}>
                              {highlightText(visitor.name || "N/A", searchTerm)}
                            </span>
                          </TableCell>
                        )}

                        {/* Company Name */}
                        {shouldShow("company") && (
                          <TableCell
                            className="text-[11px] text-gray-600 dark:text-gray-400 p-1"
                            title={visitor.companyName}
                          >
                            {highlightText(visitor.companyName || "N/A", searchTerm)}
                          </TableCell>
                        )}

                        {/* Contact */}
                        {shouldShow("contact") && (
                          <TableCell className="text-[11px] whitespace-nowrap p-1">
                            {highlightText(visitor.contact || "N/A", searchTerm)}
                          </TableCell>
                        )}

                        {/* Email */}
                        {shouldShow("email") && (
                          <TableCell
                            className="text-[11px] break-all p-1"
                            title={visitor.email}
                          >
                            {highlightText(visitor.email || "-", searchTerm)}
                          </TableCell>
                        )}

                        {/* Category */}
                        {shouldShow("category") && (
                          <TableCell className="whitespace-nowrap p-1">
                            <Badge
                              variant="success"
                              className="text-[10px] px-1 py-0 h-5"
                            >
                              {highlightText(
                                categories[visitor.category] ||
                                visitor.category ||
                                "N/A",
                                searchTerm
                              )}
                            </Badge>
                          </TableCell>
                        )}

                        {/* City */}
                        {shouldShow("city") && (
                          <TableCell
                            className="text-[11px] p-1"
                            title={visitor.city}
                          >
                            {highlightText(visitor.city || "-", searchTerm)}
                          </TableCell>
                        )}

                        {/* Gender */}
                        {shouldShow("gender") && (
                          <TableCell className="whitespace-nowrap text-[11px] p-1">
                            {visitor.gender || "-"}
                          </TableCell>
                        )}

                        {/* Profession */}
                        {shouldShow("profession") && (
                          <TableCell
                            className="text-[11px] p-1"
                            title={visitor.professions}
                          >
                            {visitor.professions || "-"}
                          </TableCell>
                        )}

                        {/* Source column hidden - data kept in backend for history tracking 
                        <TableCell className="p-1">
                          <div className="relative group flex items-center w-full max-w-[100px] cursor-help">
                            <span className="text-[11px] text-gray-500 border-b border-dotted border-gray-400 truncate w-full block">
                              {formatRegistrationSource(
                                visitor.registrationSource
                              )}
                            </span>
                            <div className="absolute bottom-full right-0 mb-2 w-max hidden group-hover:block bg-gray-900 text-white text-[10px] rounded py-1 px-2 z-10 shadow-lg">
                              <div className="font-semibold text-gray-200">
                                Source Details
                              </div>
                              <div className="text-gray-300">
                                Company:{" "}
                                <span className="text-white font-medium">
                                  {visitor.companyName || "N/A"}
                                </span>
                              </div>
                              {visitor.inviteCode && (
                                <div className="text-gray-300">
                                  Code:{" "}
                                  <span className="text-white font-mono">
                                    {visitor.inviteCode}
                                  </span>
                                </div>
                              )}
                              <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </TableCell>
                        */}

                        <TableCell className="p-1">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              to={`/visitors/view/${visitor._id || visitor.id}`}
                              title="View Visitor Details"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handlePrintCard(visitor)}
                              title="Print ID Card"
                            >
                              <PrinterIcon className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Link
                              to={`/visitors/edit/${visitor._id || visitor.id}`}
                              title="Edit Visitor"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleDelete(visitor._id || visitor.id)
                              }
                              title="Delete Visitor"
                            >
                              <TrashIcon className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination & Export Controls (Fixed at bottom) */}
          {!loading && visitors.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 border-t bg-white dark:bg-gray-800 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-sm text-gray-500">
                  Showing {showAll ? 1 : (currentPage - 1) * itemsPerPage + 1}{" "}
                  to{" "}
                  {showAll
                    ? visitors.length
                    : Math.min(
                        currentPage * itemsPerPage,
                        visitors.length
                      )}{" "}
                  of {visitors.length} entries
                  {showAll && (
                    <span className="text-green-600 ml-2 font-medium">
                      (All)
                    </span>
                  )}
                </div>

                {/* Items per page selector */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Show:
                  </span>
                  <div className="relative z-50">
                    <Select
                      value={showAll ? "all" : itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="w-16 h-8 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-medium">
                        <SelectValue>
                          {showAll ? "All" : itemsPerPage}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="min-w-16 z-[9999] shadow-xl">
                        <SelectItem value="10" className="text-sm">
                          10
                        </SelectItem>
                        <SelectItem value="20" className="text-sm">
                          20
                        </SelectItem>
                        <SelectItem value="50" className="text-sm">
                          50
                        </SelectItem>
                        <SelectItem value="all" className="text-sm">
                          All
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {/* Pagination Controls only if needed */}
                {!showAll && visitors.length > itemsPerPage && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeftIcon className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm text-gray-500 px-2">
                      Page {currentPage} of{" "}
                      {Math.ceil(visitors.length / itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage * itemsPerPage >= visitors.length}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Export Button (Always visible) */}
                <div className="ml-2 pl-2 border-l border-gray-300 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ImportVisitorsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          fetchVisitors(); // Refresh the visitor list
        }}
      />

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Photo */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
            {/* Photo Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <h3 className="text-lg font-semibold">{selectedPhoto.name}</h3>
              <p className="text-sm text-gray-300">Visitor ID: {selectedPhoto.visitorId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Visitors;
