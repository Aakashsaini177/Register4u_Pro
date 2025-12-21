import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { visitorAPI } from "@/lib/api";
import {
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ImportVisitorsModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Reset previous results
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await visitorAPI.import(formData);
      if (response.data.success) {
        setResult(response.data.data);
        toast.success("Import processed successfully!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.data.message || "Import failed");
      }
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        setResult(null);
      } else {
        toast.error("Please upload an Excel or CSV file");
      }
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const headers = [
      "Name",
      "Company", 
      "Category",
      "Contact",
      "Email",
      "City",
      "State", 
      "Country",
      "Pincode",
      "Address",
      "Gender",
      "Profession",
      "Ticket No",
      "Visitor ID"
    ];
    
    const sampleData = [
      [
        "John Doe",
        "ABC Corp",
        "VIP", 
        "9876543210",
        "john@example.com",
        "Mumbai",
        "Maharashtra",
        "India",
        "400001",
        "123 Main Street",
        "Male",
        "Software Engineer",
        "T001",
        "VIP1001"
      ],
      [
        "Jane Smith",
        "XYZ Ltd",
        "General",
        "9876543211", 
        "jane@example.com",
        "Delhi",
        "Delhi",
        "India",
        "110001",
        "456 Park Avenue",
        "Female",
        "Manager",
        "T002",
        ""
      ]
    ];

    // Create CSV content
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "visitor_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template downloaded successfully!");
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Import Visitors</DialogTitle>
      </DialogHeader>
      <DialogContent className="sm:max-w-[500px]">

        <div className="space-y-4 py-4">
          {/* Download Template Section */}
          {!result && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Need a template?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Download our Excel template with the correct format
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {!result ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <DocumentArrowUpIcon className="h-12 w-12 text-primary" />
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
                  <p className="font-medium text-gray-700">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-sm text-gray-500">
                    Excel (.xlsx) or CSV files
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Make sure your file has the correct format. Download template above if needed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">
                  Import Summary
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {result.success}
                    </div>
                    <div className="text-xs text-gray-600">Added</div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.skipped}
                    </div>
                    <div className="text-xs text-gray-600">Skipped</div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                      {result.failed}
                    </div>
                    <div className="text-xs text-gray-600">Failed</div>
                  </div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-sm border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-1">Errors:</p>
                  <ul className="list-disc pl-4 space-y-1 text-red-600">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && (
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Importing..." : "Upload & Import"}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default ImportVisitorsModal;
