import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plane,
  Train,
  Car,
  Bus,
  UserCheck,
} from "lucide-react";
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
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { SERVER_BASE_URL } from "@/lib/api";
import TravelAllotmentModal from "./TravelAllotmentModal";

const EditTravel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [allotmentModal, setAllotmentModal] = useState({ isOpen: false });

  const [formData, setFormData] = useState({
    visitorId: "",
    visitorName: "",
    mobileNumber: "",
    travelBy: "",
    flightTrainNo: "",
    fromLocation: "",
    toLocation: "",
    arrivalDate: "",
    arrivalTime: "",
    departureDate: "",
    departureTime: "",
    remarks: "",
    type: "arrival",
    status: "pending",
  });

  useEffect(() => {
    if (id) {
      fetchTravelDetails();
    }
  }, [id]);

  const fetchTravelDetails = async () => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/travel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const travel = data.data;

        setFormData({
          visitorId: travel.visitorId,
          visitorName: travel.visitorName,
          mobileNumber: travel.mobileNumber,
          travelBy: travel.travelBy,
          flightTrainNo: travel.flightTrainNo || "",
          fromLocation: travel.fromLocation,
          toLocation: travel.toLocation,
          arrivalDate: new Date(travel.arrivalDate).toISOString().split("T")[0],
          arrivalTime: travel.arrivalTime,
          departureDate: travel.departureDate
            ? new Date(travel.departureDate).toISOString().split("T")[0]
            : "",
          departureTime: travel.departureTime || "",
          remarks: travel.remarks || "",
          type: travel.type,
          status: travel.status,
        });
      } else {
        toast.error("Failed to fetch travel details");
        navigate("/travel");
      }
    } catch (error) {
      console.error("Error fetching travel details:", error);
      toast.error("Error fetching travel details");
      navigate("/travel");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (
        !formData.visitorId ||
        !formData.visitorName ||
        !formData.mobileNumber ||
        !formData.travelBy ||
        !formData.fromLocation ||
        !formData.toLocation ||
        !formData.arrivalDate ||
        !formData.arrivalTime
      ) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/travel/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Travel details updated successfully");
        navigate("/travel");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update travel details");
      }
    } catch (error) {
      console.error("Error updating travel details:", error);
      toast.error("Error updating travel details");
    } finally {
      setLoading(false);
    }
  };

  const getTravelIcon = (travelBy) => {
    switch (travelBy) {
      case "Flight":
        return <Plane className="h-4 w-4" />;
      case "Train":
        return <Train className="h-4 w-4" />;
      case "Car":
        return <Car className="h-4 w-4" />;
      case "Bus":
        return <Bus className="h-4 w-4" />;
      default:
        return null;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/travel")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Travel Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update travel information
            </p>
          </div>
        </div>
        <Button
          onClick={() => setAllotmentModal({ isOpen: true })}
          className="flex items-center gap-2"
        >
          <UserCheck className="h-4 w-4" />
          Manage Allotments
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visitor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="visitorId">Visitor ID *</Label>
                <Input
                  id="visitorId"
                  name="visitorId"
                  value={formData.visitorId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="visitorName">Visitor Name *</Label>
                <Input
                  id="visitorName"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrival">Arrival</SelectItem>
                    <SelectItem value="departure">Departure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Information */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travelBy">Travel By *</Label>
                <Select
                  value={formData.travelBy}
                  onValueChange={(value) =>
                    handleSelectChange("travelBy", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flight">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        Flight
                      </div>
                    </SelectItem>
                    <SelectItem value="Train">
                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4" />
                        Train
                      </div>
                    </SelectItem>
                    <SelectItem value="Car">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Car
                      </div>
                    </SelectItem>
                    <SelectItem value="Bus">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4" />
                        Bus
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="flightTrainNo">
                  {formData.travelBy === "Flight"
                    ? "Flight Number"
                    : formData.travelBy === "Train"
                    ? "Train Number"
                    : "Vehicle Number"}
                </Label>
                <Input
                  id="flightTrainNo"
                  name="flightTrainNo"
                  value={formData.flightTrainNo}
                  onChange={handleInputChange}
                  placeholder={
                    formData.travelBy === "Flight"
                      ? "e.g., AI101"
                      : formData.travelBy === "Train"
                      ? "e.g., 12345"
                      : "e.g., DL01AB1234"
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromLocation">From Location *</Label>
                <Input
                  id="fromLocation"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="toLocation">To Location *</Label>
                <Input
                  id="toLocation"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time Information */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Arrival Date *</Label>
                <Input
                  id="arrivalDate"
                  name="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="arrivalTime">Arrival Time *</Label>
                <Input
                  id="arrivalTime"
                  name="arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  name="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                />
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

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/travel")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Updating..." : "Update Travel Details"}
          </Button>
        </div>
      </form>

      <TravelAllotmentModal
        isOpen={allotmentModal.isOpen}
        onClose={() => setAllotmentModal({ isOpen: false })}
        travelDetail={formData} // Pass current form data which has visitor details
      />
    </div>
  );
};

export default EditTravel;
