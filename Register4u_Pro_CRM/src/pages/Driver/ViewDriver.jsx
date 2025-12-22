import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Car,
  User,
  Phone,
  Users,
  Calendar,
  FileText,
} from "lucide-react";

import { getImageUrl } from "../../lib/api";
import SafeImage from "../../components/ui/SafeImage";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/Dialog";

const ViewDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
        setDriver(data.data);
      } else {
        toast.error("Failed to fetch driver details");
        navigate("/driver");
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error("Error fetching driver details");
      navigate("/driver");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/drivers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Driver deleted successfully");
        navigate("/driver");
      } else {
        toast.error("Failed to delete driver");
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Error deleting driver");
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Driver not found
        </h2>
        <Button onClick={() => navigate("/driver")}>Back to Drivers</Button>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {driver.driverName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Driver Details</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/driver/edit/${driver.id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Driver Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Driver ID
              </label>
              <p className="text-lg font-mono font-semibold text-primary">
                {driver.driverId}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Driver Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {driver.driverName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Number
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {driver.contactNumber}
              </p>
            </div>
            {driver.secondaryContactNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Secondary Contact
                </label>
                <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {driver.secondaryContactNumber}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Employee Status
              </label>
              <div className="mt-1">
                <Badge variant={driver.isEmployee ? "default" : "secondary"}>
                  {driver.isEmployee ? "Employee" : "Non-Employee"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={driver.status === "active" ? "default" : "secondary"}
                >
                  {driver.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(driver.createdAt).toLocaleDateString()}
              </p>
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
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Vehicle Number
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {driver.vehicleNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Vehicle Type
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {driver.vehicleType}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Seating Capacity
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4" />
                {driver.seater} seats
              </p>
            </div>
            {driver.remarks && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Remarks
                </label>
                <p className="text-lg text-gray-900 dark:text-white flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1" />
                  {driver.remarks}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      {(driver.driverPhoto ||
        driver.aadharCard ||
        driver.licensePhoto ||
        driver.rcPhoto) && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {driver.driverPhoto && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Driver Photo
                  </label>
                  <div className="mt-2">
                    <SafeImage
                      src={getImageUrl(driver.driverPhoto)}
                      alt="Driver Photo"
                      className="w-32 h-32 object-contain rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() =>
                        window.open(getImageUrl(driver.driverPhoto), "_blank")
                      }
                    />
                  </div>
                </div>
              )}
              {driver.aadharCard && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Aadhar Card
                  </label>
                  <div className="mt-2">
                    <SafeImage
                      src={getImageUrl(driver.aadharCard)}
                      alt="Aadhar Card"
                      className="w-32 h-32 object-contain rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() =>
                        window.open(getImageUrl(driver.aadharCard), "_blank")
                      }
                    />
                  </div>
                </div>
              )}
              {driver.licensePhoto && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Driving License
                  </label>
                  <div className="mt-2">
                    <SafeImage
                      src={getImageUrl(driver.licensePhoto)}
                      alt="Driving License"
                      className="w-32 h-32 object-contain rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() =>
                        window.open(getImageUrl(driver.licensePhoto), "_blank")
                      }
                    />
                  </div>
                </div>
              )}
              {driver.rcPhoto && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    RC (Registration Certificate)
                  </label>
                  <div className="mt-2">
                    <SafeImage
                      src={getImageUrl(driver.rcPhoto)}
                      alt="RC Document"
                      className="w-32 h-32 object-contain rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() =>
                        window.open(getImageUrl(driver.rcPhoto), "_blank")
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Allotments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Driver Allotments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driver.allotments && driver.allotments.length > 0 ? (
            <div className="space-y-4">
              {driver.allotments.map((allotment, index) => (
                <div key={allotment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {allotment.visitorName}
                    </h3>
                    <Badge
                      variant={
                        allotment.status === "pending" ? "default" : "secondary"
                      }
                    >
                      {allotment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Visitor ID:</span>{" "}
                      {allotment.visitorId}
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span>{" "}
                      {allotment.visitorNumber}
                    </div>
                    <div>
                      <span className="font-medium">Pickup Date:</span>{" "}
                      {new Date(allotment.pickupDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Pickup Time:</span>{" "}
                      {allotment.pickupTime}
                    </div>
                    {allotment.dropDate && (
                      <div>
                        <span className="font-medium">Drop Date:</span>{" "}
                        {new Date(allotment.dropDate).toLocaleDateString()}
                      </div>
                    )}
                    {allotment.dropTime && (
                      <div>
                        <span className="font-medium">Drop Time:</span>{" "}
                        {allotment.dropTime}
                      </div>
                    )}
                    {allotment.remarks && (
                      <div className="col-span-2">
                        <span className="font-medium">Remarks:</span>{" "}
                        {allotment.remarks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No driver allotments found for this driver.
              </p>
              <Button onClick={() => navigate("/travel")} className="mt-4">
                Manage Travel Allotments
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogHeader onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Delete Driver</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this driver? This action cannot be
            undone and will remove all associated data.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Delete Driver
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ViewDriver;
