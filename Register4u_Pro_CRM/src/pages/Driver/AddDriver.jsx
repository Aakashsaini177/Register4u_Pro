import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Save,
  Car,
  User,
  Phone,
  Users,
  Edit,
} from "lucide-react";
import ImageCropper from "../../components/ui/ImageCropper";
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

const AddDriver = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

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

      const response = await fetch("http://localhost:4002/api/v1/drivers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        toast.success("Driver created successfully");
        navigate("/driver");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create driver");
      }
    } catch (error) {
      console.error("Error creating driver:", error);
      toast.error("Error creating driver");
    } finally {
      setLoading(false);
    }
  };

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
            Add Driver
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new driver profile with vehicle details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
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
                  placeholder="Enter driver name"
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
                  placeholder="Enter primary contact number"
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEmployee"
                name="isEmployee"
                checked={formData.isEmployee}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isEmployee: checked }))
                }
              />
              <Label htmlFor="isEmployee">Mark as Employee</Label>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
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
                  placeholder="e.g., DL-01-AB-1234"
                  required
                />
              </div>
              <div>
                <Label htmlFor="seater">Seater Capacity *</Label>
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
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Driver Photo */}
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
                          className="w-full h-full object-contain rounded-lg"
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

              {/* Aadhar Card */}
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
                          className="w-full h-full object-contain rounded-lg"
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

              {/* License Photo */}
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
                          className="w-full h-full object-contain rounded-lg"
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

              {/* RC Photo */}
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
                          className="w-full h-full object-contain rounded-lg"
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

        {/* Remarks */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Any additional notes about the driver or vehicle"
                rows={3}
              />
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
            {loading ? "Creating..." : "Create Driver"}
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

export default AddDriver;
