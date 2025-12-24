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
  Save,
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

const EditRoomAllotment = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Allotment ID
  const { token } = useAuthStore();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allotment, setAllotment] = useState(null);

  const [formData, setFormData] = useState({
    roomId: "",
    visitorId: "",
    visitorName: "",
    visitorNumber: "",
    checkInDate: "",
    checkOutDate: "",
    remarks: "",
  });

  // Fetch Allotment Details on Mount
  useEffect(() => {
    if (id) {
      if (!hotel) {
        // Only fetch everything once
        fetchAllotmentDetails();
      }
    }
  }, [id]);

  const fetchAllotmentDetails = async () => {
    try {
      // We don't have a direct "get allotment by id" API documented but usually we can get it via hotel or list.
      // However, let's try to infer fetch from the hotel list logic or rely on ViewHotel state? No, direct link.
      // The `updateRoomAllotment` returns data, but we need GET.
      // Let's assume we can fetch hotel details and find the allotment there OR add a get endpoint.
      // Actually, we can just fetch the Hotel Details for the hotel of this allotment if we knew the hotel ID.
      // BUT we don't know the hotel ID from the URL param :id (allotmentId).
      // We might need to add a GET /allotments/:id endpoint or iterate all hotels.
      // Wait, `hotelController.js` has `getRoomAllotments` list but not single get.

      // workaround: The user clicks from ViewHotel, where we have hotelId.
      // Maybe we should pass hotelId in URL? /hotel/allotment/edit/:hotelId/:allotmentId
      // Or simpler: Fetch all hotels and find the allotment? Too slow.
      // Ideally: GET /api/v1/hotels/allotments/:id
      // CHECK `hotelRoutes.js` -> We have `getRoomAllotments`.
      // Let's check if we can fetch single allotment.
      // For now, I will assume we need to implement GET /allotments/:id in backend or use what we have.
      // Wait, I can't modify backend again easily without asking.
      // Let's modify `hotelRoutes.js` to add GET /allotments/:id if missing.
      // Actually, I can use the `getRoomAllotments` list endpoint and filter? No...
      // Let's add GET /allotments/:id to backend first. It is cleaner.

      // ...Wait, I'm in the middle of creating this file.
      // I'll add the necessary code here assuming the endpoint exists, then go fix backend.

      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/hotels/allotments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allot = data.data;
        setAllotment(allot);
        setHotel(allot.hotelId);

        // Pre-fill form
        setFormData({
          roomId: allot.roomId._id,
          visitorId: allot.visitorId,
          visitorName: allot.visitorName,
          visitorNumber: allot.visitorNumber,
          checkInDate: allot.checkInDate
            ? new Date(allot.checkInDate).toISOString().split("T")[0]
            : "",
          checkOutDate: allot.checkOutDate
            ? new Date(allot.checkOutDate).toISOString().split("T")[0]
            : "",
          remarks: allot.remarks || "",
        });

        // Now fetch hotel rooms to populate dropdown
        fetchHotelDetails(allot.hotelId._id);
      } else {
        toast.error("Failed to fetch allotment details");
        navigate(-1);
      }
    } catch (err) {
      console.error("Error fetching allotment:", err);
      // toast.error("Error fetching details");
    }
  };

  const fetchHotelDetails = async (hotelId) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/hotels/${hotelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const hotelData = data.data;
        setHotel(hotelData);

        const allRooms = [];
        hotelData.categories?.forEach((category) => {
          category.rooms?.forEach((room) => {
            // For Edit: We need to make the CURRENT allotted room "Available" in the dropdown list
            // so the user can keep it selected without it being disabled.
            // Strategy: The room list 'status' comes from DB.
            // If room.id === currentAllotment.roomId, treat as available for THIS user.

            allRooms.push({
              ...room,
              id: room._id,
              categoryName: category.categoryName,
              occupancy: category.occupancy,
            });
          });
        });
        setRooms(allRooms);
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorSearch = async (vid) => {
    if (!vid || vid.length < 3) return;
    try {
      const response = await visitorAPI.getById(vid);
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
      console.log("Visitor lookup failed or not found yet");
    }
  };

  // Debounce logic for Visitor ID search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (
        formData.visitorId &&
        formData.visitorId.length >= 3 &&
        formData.visitorId !== allotment?.visitorId
      ) {
        // Only search if changed from original
        handleVisitorSearch(formData.visitorId);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.visitorId, allotment]);

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
      const response = await fetch(
        `${SERVER_BASE_URL}/api/v1/hotels/allotments/${id}`,
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
        toast.success("Allotment updated successfully!");
        navigate(-1); // Go back
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update allotment");
      }
    } catch (error) {
      console.error("Error updating allotment:", error);
      toast.error("Error updating allotment");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find((room) => room.id === formData.roomId);

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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Allotment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Edit room allotment for {hotel?.hotelName}
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
                    {/* Group rooms by Category - Flattened for Select component compatibility */}
                    {Object.entries(
                      rooms.reduce((acc, room) => {
                        if (!acc[room.categoryName])
                          acc[room.categoryName] = [];
                        acc[room.categoryName].push(room);
                        return acc;
                      }, {})
                    ).map(([category, categoryRooms]) => [
                      <div
                        key={`cat-${category}`}
                        className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-800"
                      >
                        {category}
                      </div>,
                      ...categoryRooms.map((room) => {
                        // Check if this room is the currently selected one in the form (even if occupied status in DB)
                        // OR if it is truly available.
                        const isCurrentRoom = room.id === allotment?.roomId._id;
                        const isAvailable = room.status === "available";
                        const isSelectable = isAvailable || isCurrentRoom;

                        return (
                          <SelectItem
                            key={room.id}
                            value={room.id.toString()}
                            disabled={!isSelectable}
                            className={!isSelectable ? "opacity-50" : ""}
                          >
                            <span className="flex items-center justify-between w-full min-w-[200px]">
                              <span>
                                {room.roomNumber} (Occ: {room.occupancy})
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded uppercase ml-2 ${
                                  isAvailable
                                    ? "bg-green-100 text-green-700"
                                    : isCurrentRoom
                                    ? "bg-blue-100 text-blue-700" // Highlight current room
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isCurrentRoom
                                  ? "Current"
                                  : room.status === "occupied"
                                  ? "Occupied"
                                  : "Available"}
                              </span>
                            </span>
                          </SelectItem>
                        );
                      }),
                    ])}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoom && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
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
                      {/* Status logic specifically for View Only */}
                      <strong className="text-gray-600 dark:text-gray-400">
                        Status:
                      </strong>
                      <span className="ml-1 text-xs px-2 py-0.5 bg-gray-200 rounded">
                        {selectedRoom.id === allotment?.roomId._id
                          ? "Current Assignment"
                          : selectedRoom.status}
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
                  Change ID to search/swap visitor
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
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Updating..." : "Update Allotment"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditRoomAllotment;
