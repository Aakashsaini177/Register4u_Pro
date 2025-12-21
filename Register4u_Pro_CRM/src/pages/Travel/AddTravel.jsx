import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Plane, Train, Car, Bus, Save } from "lucide-react";
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

const AddTravel = () => {
  const navigate = useNavigate();
  const { type: paramType } = useParams();
  const location = useLocation(); // Add hook usage
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Determine if this is departure mode based on URL or param
  const isDeparture =
    location.pathname.includes("departure") || paramType === "departure";
  const type = isDeparture ? "departure" : "arrival";

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
    // Departure fields might be empty initially, will be mapped on submit if in departure mode
    departureDate: "",
    departureTime: "",
    remarks: "",
    type: type, // Set initial type correctly
  });

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

  // Persistence logic for useState form
  React.useEffect(() => {
    const saved = sessionStorage.getItem("add_travel_form");
    if (saved) {
      try {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }
  }, []);

  React.useEffect(() => {
    sessionStorage.setItem("add_travel_form", JSON.stringify(formData));
  }, [formData]);

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

      // Prepare payload
      let payload = { ...formData, type };

      // IMPORTANT: If we are in 'departure' mode, the fields on the screen (mapped to arrivalDate/arrivalTime in state)
      // actually represent the DEPARTURE date/time. The user enters "When they are leaving".
      // So we map them to the backend's departure fields.
      if (type === "departure") {
        payload.departureDate = formData.arrivalDate;
        payload.departureTime = formData.arrivalTime;
        // We might want to clear arrival fields if they shouldn't be updated,
        // but backend logic handles "update" by merging.
        // For cleanliness, we could set them undefined if we ONLY want to update departure,
        // but typically the form lets you update all details.
      }

      const response = await fetch("http://localhost:4002/api/v1/travel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          `${
            type === "arrival" ? "Arrival" : "Departure"
          } details saved successfully`
        );
        sessionStorage.removeItem("add_travel_form");
        navigate("/travel");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save travel details");
      }
    } catch (error) {
      console.error("Error saving travel details:", error);
      toast.error("Error saving travel details");
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Add {type === "arrival" ? "Arrival" : "Departure"} Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record visitor {type === "arrival" ? "arrival" : "departure"}{" "}
            information
          </p>
        </div>
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
                  placeholder="Enter visitor ID"
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
                  placeholder="Enter visitor name"
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
                  placeholder="Enter mobile number"
                  required
                />
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
                    <SelectValue placeholder="Select transport mode" />
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
                      ? "e.g., IndiGo 6E 2487"
                      : formData.travelBy === "Train"
                      ? "e.g., Sealdah SF Exp 12988"
                      : "e.g., DL-01-AB-1234"
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromLocation">From *</Label>
                <Input
                  id="fromLocation"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleInputChange}
                  placeholder="Departure location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="toLocation">To *</Label>
                <Input
                  id="toLocation"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleInputChange}
                  placeholder="Destination location"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {type === "arrival" ? "Arrival" : "Departure"} Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">
                  {type === "arrival" ? "Arrival" : "Departure"} Date *
                </Label>
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
                <Label htmlFor="arrivalTime">
                  {type === "arrival" ? "Arrival" : "Departure"} Time *
                </Label>
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
            {type === "departure" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureDate">Return Date</Label>
                  <Input
                    id="departureDate"
                    name="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="departureTime">Return Time</Label>
                  <Input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Any additional notes or special requirements"
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
            {loading
              ? "Saving..."
              : `Save ${type === "arrival" ? "Arrival" : "Departure"} Details`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTravel;
