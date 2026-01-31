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
  Search,
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
import { visitorAPI, SERVER_BASE_URL } from "../../lib/api";

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
    occupancy: "1",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: "",
    remarks: "",
  });

  useEffect(() => {
    if (hotelId) {
      if (formData.checkInDate) {
        // Fetch availability if check-in date is set (and optional checkout)
        fetchAvailability();
      } else {
        // Reset to default (fetch hotel details again to get base state?)
        // Or just rely on base details. Best to re-fetch hotel details to reset.
        fetchHotelDetails();
      }
    }
  }, [hotelId, formData.checkInDate, formData.checkOutDate]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // If no checkout date, assume 1 day for availability check?
      // Or send empty. Backend handles empty dates by returning base availability.
      // But for "Date Aware", we need a range. Default to checkIn + 1 day if checkout missing.
      const cIn = formData.checkInDate;
      let cOut = formData.checkOutDate;
      if (!cOut) {
        const d = new Date(cIn);
        d.setDate(d.getDate() + 1);
        cOut = d.toISOString().split("T")[0];
      }

      const query = new URLSearchParams({
        checkInDate: cIn,
        checkOutDate: cOut,
      }).toString();

      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/hotels/${hotelId}/rooms/available?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const resData = await response.json();
        const availableList = resData.data;

        // Ensure we have base hotel details
        let baseHotel = hotel;
        if (!baseHotel) {
          const hotelRes = await fetch(
            `${SERVER_BASE_URL}/api/v1/hotels/${hotelId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (hotelRes.ok) {
            const hData = await hotelRes.json();
            baseHotel = hData.data;
            setHotel(baseHotel);
          }
        }

        if (baseHotel && baseHotel.categories) {
          const updatedRooms = [];
          const availabilityMap = new Map();
          availableList.forEach((r) => {
            availabilityMap.set(r.id.toString(), r);
          });

          baseHotel.categories.forEach((category) => {
            category.rooms?.forEach((room) => {
              const rId = room._id.toString();
              const availableData = availabilityMap.get(rId);

              const isAvailable = !!availableData;

              const currentOcc = availableData
                ? availableData.currentOccupancy
                : isAvailable
                  ? 0
                  : category.occupancy;

              updatedRooms.push({
                ...room,
                id: room._id,
                categoryName: category.categoryName,
                occupancy: category.occupancy,
                status: isAvailable ? "available" : "occupied",
                currentOccupancy: currentOcc,
                maxOccupancy: category.occupancy,
                detailStatus: isAvailable
                  ? currentOcc > 0
                    ? "partial"
                    : "empty"
                  : "full",
              });
            });
          });
          setRooms(updatedRooms);
        }
      }
    } catch (err) {
      console.error("Availability Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelDetails = async () => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/hotels/${hotelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setHotel(data.data);

        // Flatten all rooms from all categories with initial status
        // Note: data.data.categories.rooms has the static status.
        // We will default to that until dates are selected.
        const allRooms = [];
        data.data.categories?.forEach((category) => {
          category.rooms?.forEach((room) => {
            allRooms.push({
              ...room,
              id: room._id,
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
        `${SERVER_BASE_URL}/api/v1/hotels/allotments`,
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
        },
      );

      if (response.ok) {
        toast.success(
          "Room allotted successfully! SMS notification sent to visitor.",
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

  // Auto-correct occupancy if it exceeds limit for selected room
  useEffect(() => {
    if (selectedRoom) {
      const current = selectedRoom.currentOccupancy || 0;
      const capacity = selectedRoom.maxOccupancy || selectedRoom.occupancy || 1;
      const remaining = capacity - current;

      if (parseInt(formData.occupancy) > remaining) {
        // Reset to max possible or 1
        const newMax = remaining > 0 ? remaining : 1;
        setFormData((prev) => ({ ...prev, occupancy: newMax.toString() }));

        if (remaining > 0 && parseInt(formData.occupancy) !== newMax) {
          toast.error(
            `Occupancy adjusted to ${newMax} based on room availability.`,
          );
        }
      }
    }
  }, [selectedRoom, formData.occupancy]);

  if (loading && !hotel) {
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
          {/* Availability Summary */}
          <Card className="col-span-1 lg:col-span-2 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-800 dark:text-blue-300">
                Room Availability{" "}
                {formData.checkInDate ? `(${formData.checkInDate})` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  rooms.reduce((acc, room) => {
                    if (!acc[room.categoryName]) {
                      acc[room.categoryName] = { total: 0, available: 0 };
                    }
                    acc[room.categoryName].total++;
                    if (room.status === "available") {
                      acc[room.categoryName].available++;
                    }
                    return acc;
                  }, {}),
                ).map(([category, stats]) => (
                  <div
                    key={category}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {category}
                    </p>
                    <p className="text-xl font-bold flex items-baseline gap-1">
                      <span className="text-green-600 dark:text-green-400">
                        {stats.available}
                      </span>
                      <span className="text-xs text-gray-400">
                        / {stats.total} Available
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  <SelectTrigger
                    displayValue={
                      selectedRoom
                        ? `${selectedRoom.roomNumber} (${selectedRoom.categoryName})`
                        : undefined
                    }
                  >
                    <SelectValue placeholder="Choose a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Group rooms by Category - Flattened for Select component compatibility */}
                    {(() => {
                      const grouped = rooms.reduce((acc, room) => {
                        if (!acc[room.categoryName])
                          acc[room.categoryName] = [];
                        acc[room.categoryName].push(room);
                        return acc;
                      }, {});

                      const options = [];
                      Object.entries(grouped).forEach(
                        ([category, categoryRooms]) => {
                          // Add Category Header
                          options.push(
                            <div
                              key={`cat-${category}`}
                              className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700"
                            >
                              {category}
                            </div>,
                          );
                          // Add Rooms
                          categoryRooms.forEach((room) => {
                            options.push(
                              <SelectItem
                                key={room.id}
                                value={room.id.toString()}
                                disabled={room.status !== "available"}
                                className={
                                  room.status !== "available"
                                    ? "opacity-50"
                                    : ""
                                }
                              >
                                <span className="flex items-center justify-between w-full min-w-[200px]">
                                  <span>
                                    {room.roomNumber} (
                                    {room.currentOccupancy || 0}/
                                    {room.maxOccupancy || room.occupancy})
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded uppercase ml-2 ${
                                      room.detailStatus === "empty"
                                        ? "bg-green-100 text-green-700"
                                        : room.detailStatus === "partial"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {room.detailStatus === "full"
                                      ? "Full"
                                      : room.detailStatus === "partial"
                                        ? "Partial"
                                        : "Available"}
                                  </span>
                                </span>
                              </SelectItem>,
                            );
                          });
                        },
                      );
                      return options;
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Usage Type - Moved here */}
              {selectedRoom &&
                (selectedRoom.maxOccupancy > 1 ||
                  selectedRoom.occupancy > 1) && (
                  <div className="mt-4 mb-4">
                    <Label className="mb-2 block text-sm font-medium">
                      Room Usage Type
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="usageType"
                          checked={formData.usageType !== "private"}
                          onChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              usageType: "shared",
                              occupancy: "1",
                            }));
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm font-medium">
                          Shared (Allocate per Bed)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="usageType"
                          checked={formData.usageType === "private"}
                          onChange={() => {
                            const cap =
                              selectedRoom.maxOccupancy ||
                              selectedRoom.occupancy ||
                              1;
                            const current = selectedRoom.currentOccupancy || 0;
                            const remaining = cap - current;
                            setFormData((prev) => ({
                              ...prev,
                              usageType: "private",
                              occupancy: remaining.toString(),
                            }));
                          }}
                          disabled={
                            selectedRoom.status !== "available" &&
                            selectedRoom.detailStatus !== "empty"
                          }
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm font-medium">
                          Private (Book Full Room)
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.usageType === "private"
                        ? "Booking entire room. No other guests allowed."
                        : "Other guests may be allotted to remaining beds."}
                    </p>
                  </div>
                )}

              {selectedRoom && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-primary">
                    Selected Room Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong className="text-gray-600 dark:text-gray-400">
                        Room Number:
                      </strong>{" "}
                      {selectedRoom.roomNumber}
                    </p>
                    <p>
                      <strong className="text-gray-600 dark:text-gray-400">
                        Category:
                      </strong>{" "}
                      {selectedRoom.categoryName}
                    </p>
                    <p>
                      <strong className="text-gray-600 dark:text-gray-400">
                        Occupancy:
                      </strong>{" "}
                      {selectedRoom.occupancy} person(s)
                    </p>
                    <p>
                      <strong className="text-gray-600 dark:text-gray-400">
                        Status:
                      </strong>
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
                <div className="flex gap-2">
                  <Input
                    id="visitorId"
                    name="visitorId"
                    value={formData.visitorId}
                    onChange={handleInputChange}
                    onBlur={() => handleVisitorSearch(formData.visitorId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVisitorSearch(formData.visitorId);
                      }
                    }}
                    placeholder="Enter visitor ID (e.g. KJ1001)"
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => handleVisitorSearch(formData.visitorId)}
                    variant="outline"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or click Search to autofill details
                </p>
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
              <div>
                <Label htmlFor="occupancy">Number of Guests (Pax) *</Label>
                <Select
                  value={formData.occupancy}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, occupancy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupancy" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      // Logic to limit guests based on remaining capacity
                      let maxGuests = 10;
                      if (selectedRoom) {
                        const current = selectedRoom.currentOccupancy || 0;
                        const capacity =
                          selectedRoom.maxOccupancy ||
                          selectedRoom.occupancy ||
                          2; // Default to 2 if unknown
                        const remaining = capacity - current;
                        maxGuests = remaining > 0 ? remaining : 0;
                      }

                      // Generate options
                      if (maxGuests <= 0) {
                        // Should be disabled ideally, but show 0 or "Full"
                        return (
                          <SelectItem value="0" disabled>
                            No slots available
                          </SelectItem>
                        );
                      }

                      return Array.from(
                        { length: maxGuests },
                        (_, i) => i + 1,
                      ).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Person" : "Persons"}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedRoom ? (
                    <span
                      className={
                        (selectedRoom.maxOccupancy || selectedRoom.occupancy) -
                          (selectedRoom.currentOccupancy || 0) ===
                        1
                          ? "text-orange-600 font-medium"
                          : ""
                      }
                    >
                      Max allowed:{" "}
                      {(selectedRoom.maxOccupancy || selectedRoom.occupancy) -
                        (selectedRoom.currentOccupancy || 0)}{" "}
                      guests
                    </span>
                  ) : (
                    "How many guests will stay in this room?"
                  )}
                </p>
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
