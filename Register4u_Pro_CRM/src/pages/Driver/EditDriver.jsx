import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Car,
  User,
  Phone,
  Users,
  Edit,
} from "lucide-react";
import ImageCropper from "../../components/ui/ImageCropper";

// Helper function to construct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:4002/${imagePath}`;
};
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { Checkbox } from "../../components/ui/Checkbox";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

const EditDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    driverName: "",
    vehicleNumber: "",
    contactNumber: "",
    secondaryContactNumber: "",
    seater: 4,
    vehicleType: "",
    customVehicleType: "",
    driverPhoto: null,
    aadharCard: null,
    licensePhoto: null,
    rcPhoto: null,
    isEmployee: false,
    remarks: "",
    status: "active",
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [rcPreview, setRcPreview] = useState(null);
  const [showCustomVehicleInput, setShowCustomVehicleInput] = useState(false);

  // Cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [currentCropType, setCurrentCropType] = useState(null);
  const [rawImages, setRawImages] = useState({
    driverPhoto: null,
    aadharCard: null,
    licensePhoto: null,
    rcPhoto: null,
  });

  useEffect(() => {
    if (id) {
      fetchDriverDetails();
    }
  }, [id]);

  const fetchDriverDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/drivers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const driver = data.data;

        setFormData({
          driverName: driver.driverName,
          vehicleNumber: driver.vehicleNumber,
          contactNumber: driver.contactNumber,
          secondaryContactNumber: driver.secondaryContactNumber || "",
          seater: driver.seater,
          vehicleType: driver.vehicleType,
          customVehicleType: "",
          driverPhoto: null, // Will be handled separately for file uploads
          aadharCard: null, // Will be handled separately for file uploads
          licensePhoto: null,
          rcPhoto: null,
          isEmployee: driver.isEmployee,
          remarks: driver.remarks || "",
          status: driver.status,
        });

        // Set preview images if they exist
        if (driver.driverPhoto) {
          setPhotoPreview(getImageUrl(driver.driverPhoto));
        }
        if (driver.aadharCard) {
          setAadharPreview(getImageUrl(driver.aadharCard));
        }
        if (driver.licensePhoto) {
          setLicensePreview(getImageUrl(driver.licensePhoto));
        }
        if (driver.rcPhoto) {
          setRcPreview(getImageUrl(driver.rcPhoto));
        }
      } else {
        toast.error("Failed to fetch driver details");
        navigate("/driver");
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error("Error fetching driver details");
      navigate("/driver");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Show custom input if "Add New" is selected
    if (name === "vehicleType" && value === "custom") {
      setShowCustomVehicleInput(true);
    } else if (name === "vehicleType") {
      setShowCustomVehicleInput(false);
      setFormData((prev) => ({
        ...prev,
        customVehicleType: "",
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Create URL for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawImages((prev) => ({
          ...prev,
          [type]: e.target.result,
        }));
        setCurrentCropImage(e.target.result);
        setCurrentCropType(type);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = (croppedImgUrl) => {
    // Set preview based on type
    if (currentCropType === "driverPhoto") {
      setPhotoPreview(croppedImgUrl);
    } else if (currentCropType === "aadharCard") {
      setAadharPreview(croppedImgUrl);
    } else if (currentCropType === "licensePhoto") {
      setLicensePreview(croppedImgUrl);
    } else if (currentCropType === "rcPhoto") {
      setRcPreview(croppedImgUrl);
    }

    // Convert blob URL to File for form data
    fetch(croppedImgUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `${currentCropType}.jpg`, {
          type: "image/jpeg",
        });
        setFormData((prev) => ({
          ...prev,
          [currentCropType]: file,
        }));
      });

    setShowCropper(false);
    setCurrentCropImage(null);
    setCurrentCropType(null);
  };

  // Get cropping configuration based on document type
  const getCropConfig = (type) => {
    switch (type) {
      case "driverPhoto":
        return {
          aspect: 3 / 4, // Portrait ratio for passport photo (600x800px)
          freeAspect: false,
          title: "Crop Driver Photo (Passport Size - 600x800px)",
        };
      case "aadharCard":
        return {
          aspect: 16 / 10, // Landscape ratio for Aadhar
          freeAspect: true,
          title: "Crop Aadhar Card (Free Cropping)",
        };
      case "licensePhoto":
        return {
          aspect: 16 / 10, // Landscape ratio for License
          freeAspect: true,
          title: "Crop Driving License (Free Cropping)",
        };
      case "rcPhoto":
        return {
          aspect: 16 / 10, // Landscape ratio for RC
          freeAspect: true,
          title: "Crop RC Document (Free Cropping)",
        };
      default:
        return {
          aspect: 3 / 4,
          freeAspect: false,
          title: "Crop Image",
        };
    }
  };

  const handleEditPhoto = (type) => {
    if (rawImages[type]) {
      setCurrentCropImage(rawImages[type]);
      setCurrentCropType(type);
      setShowCropper(true);
    } else {
      toast.error("Please upload an image first to crop");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const finalVehicleType =
        formData.vehicleType === "custom"
          ? formData.customVehicleType
          : formData.vehicleType;

      if (
        !formData.driverName ||
        !formData.vehicleNumber ||
        !formData.contactNumber ||
        !formData.seater ||
        !finalVehicleType
      ) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (
        formData.vehicleType === "custom" &&
        !formData.customVehicleType.trim()
      ) {
        toast.error("Please enter custom vehicle type");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("driverName", formData.driverName);
      submitData.append("vehicleNumber", formData.vehicleNumber);
      submitData.append("contactNumber", formData.contactNumber);
      if (formData.secondaryContactNumber) {
        submitData.append(
          "secondaryContactNumber",
          formData.secondaryContactNumber
        );
      }
      submitData.append("seater", formData.seater);
      submitData.append("vehicleType", finalVehicleType);
      submitData.append("isEmployee", formData.isEmployee);
      submitData.append("remarks", formData.remarks);
      submitData.append("status", formData.status);

      if (formData.driverPhoto) {
        submitData.append("driverPhoto", formData.driverPhoto);
      }
      if (formData.aadharCard) {
        submitData.append("aadharCard", formData.aadharCard);
      }
      if (formData.licensePhoto) {
        submitData.append("licensePhoto", formData.licensePhoto);
      }
      if (formData.rcPhoto) {
        submitData.append("rcPhoto", formData.rcPhoto);
      }

      const response = await fetch(
        `http://localhost:4002/api/v1/drivers/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        }
      );

      if (response.ok) {
        toast.success("Driver updated successfully");
        navigate("/driver");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update driver");
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      toast.error("Error updating driver");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/driver")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Driver
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update driver information and vehicle details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverName">Driver Name *</Label>
                <Input
                  id="driverName"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secondaryContactNumber">
                  Secondary Contact Number
                </Label>
                <Input
                  id="secondaryContactNumber"
                  name="secondaryContactNumber"
                  value={formData.secondaryContactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter secondary contact number (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_duty">On Duty</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEmployee"
                  name="isEmployee"
                  checked={formData.isEmployee}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isEmployee: checked }))
                  }
                />
                <Label htmlFor="isEmployee">Is Employee</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                <Input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) =>
                    handleSelectChange("vehicleType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                    <SelectItem value="Minivan">Minivan</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Tempo">Tempo</SelectItem>
                    <SelectItem value="Auto Rickshaw">Auto Rickshaw</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="custom">
                      ➕ Add New Vehicle Type
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showCustomVehicleInput && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter new vehicle type"
                      value={formData.customVehicleType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customVehicleType: e.target.value,
                        }))
                      }
                      className="border-blue-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Enter the new vehicle type name
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="seater">Seating Capacity *</Label>
              <Select
                value={formData.seater.toString()}
                onValueChange={(value) =>
                  handleSelectChange("seater", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seater capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 Seater</SelectItem>
                  <SelectItem value="6">6 Seater</SelectItem>
                  <SelectItem value="8">8 Seater</SelectItem>
                  <SelectItem value="12">12 Seater</SelectItem>
                  <SelectItem value="16">16 Seater</SelectItem>
                  <SelectItem value="20">20 Seater</SelectItem>
                  <SelectItem value="25">25 Seater</SelectItem>
                  <SelectItem value="30">30 Seater</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="driverPhoto">Driver Photo</Label>
                <div className="mt-2 relative">
                  <input
                    type="file"
                    id="driverPhoto"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "driverPhoto")}
                    className="hidden"
                  />
                  <label
                    htmlFor="driverPhoto"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {photoPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={photoPreview}
                          alt="Driver photo preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {rawImages.driverPhoto && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditPhoto("driverPhoto");
                            }}
                            className="absolute bottom-1 right-1 h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center"
                            title="Edit / Crop"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          driver photo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          (Max size: 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="aadharCard">Aadhar Card</Label>
                <div className="mt-2 relative">
                  <input
                    type="file"
                    id="aadharCard"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "aadharCard")}
                    className="hidden"
                  />
                  <label
                    htmlFor="aadharCard"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {aadharPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={aadharPreview}
                          alt="Aadhar card preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {rawImages.aadharCard && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditPhoto("aadharCard");
                            }}
                            className="absolute bottom-1 right-1 h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center"
                            title="Edit / Crop"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          Aadhar card
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          (Max size: 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="licensePhoto">Driving License</Label>
                <div className="mt-2 relative">
                  <input
                    type="file"
                    id="licensePhoto"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "licensePhoto")}
                    className="hidden"
                  />
                  <label
                    htmlFor="licensePhoto"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {licensePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={licensePreview}
                          alt="License preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {rawImages.licensePhoto && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditPhoto("licensePhoto");
                            }}
                            className="absolute bottom-1 right-1 h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center"
                            title="Edit / Crop"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          license
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          (Max size: 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="rcPhoto">RC (Registration Certificate)</Label>
                <div className="mt-2 relative">
                  <input
                    type="file"
                    id="rcPhoto"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "rcPhoto")}
                    className="hidden"
                  />
                  <label
                    htmlFor="rcPhoto"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {rcPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={rcPreview}
                          alt="RC preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {rawImages.rcPhoto && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditPhoto("rcPhoto");
                            }}
                            className="absolute bottom-1 right-1 h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center"
                            title="Edit / Crop"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          RC document
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          (Max size: 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/driver")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Updating..." : "Update Driver"}
          </Button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {showCropper && currentCropType && (
        <ImageCropper
          imageSrc={currentCropImage}
          onCrop={handleCrop}
          onCancel={() => {
            setShowCropper(false);
            setCurrentCropImage(null);
            setCurrentCropType(null);
          }}
          {...getCropConfig(currentCropType)}
        />
      )}
    </div>
  );
};

export default EditDriver;
