import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  Send,
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
import { visitorAPI } from "../../lib/api";

const RoomAllotment = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { token } = useAuthStore();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomId: "",
    visitorId: "",
    visitorName: "",
    visitorNumber: "",
    checkInDate: "",
    checkOutDate: "",
    remarks: "",
  });

  useEffect(() => {
    if (hotelId) {
      fetchHotelDetails();
    }
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/hotels/${hotelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHotel(data.data);

        // Flatten all rooms from all categories
        const allRooms = [];
        data.data.categories?.forEach((category) => {
          category.rooms?.forEach((room) => {
            allRooms.push({
              ...room,
              categoryName: category.categoryName,
              occupancy: category.occupancy,
            });
          });
        });
        setRooms(allRooms);
      } else {
        toast.error("Failed to fetch hotel details");
        navigate("/hotel");
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      toast.error("Error fetching hotel details");
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorSearch = async (id) => {
    if (!id || id.length < 3) return;

    // Show loading toast or small indicator? Toast might be too much if typing fast.
    // Ideally onBlur is fine.

    try {
      const response = await visitorAPI.getById(id);
      if (response.data.success && response.data.data) {
        const visitor = response.data.data;
        setFormData((prev) => ({
          ...prev,
          visitorName: visitor.name || "",
          visitorNumber: visitor.contact || "",
        }));
        toast.success(`Visitor details found: ${visitor.name}`);
      }
    } catch (error) {
      // Silent fail or toast?
      // If 404, maybe notify
      console.error("Visitor lookup failed", error);
      if (error.response?.status === 404) {
        toast.error("Visitor not found with this ID");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form data
      if (
        !formData.roomId ||
        !formData.visitorId ||
        !formData.visitorName ||
        !formData.visitorNumber ||
        !formData.checkInDate
      ) {
        toast.error("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      const response = await fetch(
        "http://localhost:4002/api/v1/hotels/allotments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            hotelId: hotelId, // Send as string, backend expects ObjectId
          }),
        }
      );

      if (response.ok) {
        toast.success(
          "Room allotted successfully! SMS notification sent to visitor."
        );
        navigate("/hotel");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to allot room");
      }
    } catch (error) {
      console.error("Error allotting room:", error);
      toast.error("Error allotting room");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find((room) => room.id === formData.roomId); // Compare strings

  if (loading) {
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
          onClick={() => navigate("/hotel")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Room Allotment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Allot room for visitor at {hotel?.hotelName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Room Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId">Select Room *</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, roomId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.roomNumber} - {room.categoryName} (Occupancy:{" "}
                        {room.occupancy})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoom && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Room Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Room Number:</strong> {selectedRoom.roomNumber}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedRoom.categoryName}
                    </p>
                    <p>
                      <strong>Occupancy:</strong> {selectedRoom.occupancy}{" "}
                      person(s)
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`ml-1 px-2 py-1 rounded text-xs ${
                          selectedRoom.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedRoom.status}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visitor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Visitor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visitorId">Visitor ID *</Label>
                <Input
                  id="visitorId"
                  name="visitorId"
                  value={formData.visitorId}
                  onChange={handleInputChange}
                  onBlur={() => handleVisitorSearch(formData.visitorId)}
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
                <Label htmlFor="visitorNumber">Mobile Number *</Label>
                <Input
                  id="visitorNumber"
                  name="visitorNumber"
                  value={formData.visitorNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-in/Check-out Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in & Check-out Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  name="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <Input
                  id="checkOutDate"
                  name="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
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
                placeholder="Any special requirements or notes"
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
            onClick={() => navigate("/hotel")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Allotting..." : "Allot Room & Send SMS"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoomAllotment;
