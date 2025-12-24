import React, { useState, useEffect } from "react";
import {
  X,
  Hotel,
  Car,
  Save,
  Calendar,
  Clock,
  User,
  Phone,
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
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "../../lib/api";

const TravelAllotmentModal = ({ isOpen, onClose, travelDetail }) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [allotmentType, setAllotmentType] = useState("hotel"); // 'hotel' or 'driver'

  // Hotel allotment state
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [hotelRemarks, setHotelRemarks] = useState("");

  // Driver allotment state
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [driverRemarks, setDriverRemarks] = useState("");

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [currentAllotmentId, setCurrentAllotmentId] = useState(null);

  useEffect(() => {
    if (isOpen && travelDetail) {
      fetchHotels();
      fetchDrivers();
      resetForm();

      // Check for existing allotments based on current type
      checkExistingAllotment(allotmentType);
    }
  }, [isOpen, travelDetail]);

  // Re-check when allotment type changes
  useEffect(() => {
    if (isOpen && travelDetail) {
      checkExistingAllotment(allotmentType);
    }
  }, [allotmentType]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentAllotmentId(null);
    setSelectedHotel("");
    setSelectedRoom("");
    setCheckInDate("");
    setCheckOutDate("");
    setHotelRemarks("");
    setSelectedDriver("");
    setPickupDate("");
    setPickupTime("");
    setDropDate("");
    setDropTime("");
    setDriverRemarks("");

    // Set defaults from travel detail
    if (travelDetail?.arrivalDate) {
      const dateStr = new Date(travelDetail.arrivalDate)
        .toISOString()
        .split("T")[0];
      setCheckInDate(dateStr);
      setPickupDate(dateStr);
    }
    if (travelDetail?.arrivalTime) {
      setPickupTime(travelDetail.arrivalTime);
    }
  };

  const checkExistingAllotment = (type) => {
    if (!travelDetail) return;

    if (type === "hotel" && travelDetail.hotelAllotments?.length > 0) {
      const existing = travelDetail.hotelAllotments[0];
      setIsEditing(true);
      setCurrentAllotmentId(existing._id); // Assuming _id is available
      setSelectedHotel(existing.hotel?._id || existing.hotelId);
      // We need to fetch rooms for this hotel to set selectedRoom correctly
      if (existing.hotel?._id || existing.hotelId) {
        fetchHotelRooms(existing.hotel?._id || existing.hotelId);
      }
      setSelectedRoom(existing.room?._id || existing.roomId);
      setCheckInDate(
        existing.checkInDate
          ? new Date(existing.checkInDate).toISOString().split("T")[0]
          : ""
      );
      setCheckOutDate(
        existing.checkOutDate
          ? new Date(existing.checkOutDate).toISOString().split("T")[0]
          : ""
      );
      setHotelRemarks(existing.remarks || "");
    } else if (type === "driver" && travelDetail.driverAllotments?.length > 0) {
      const existing = travelDetail.driverAllotments[0];
      setIsEditing(true);
      setCurrentAllotmentId(existing._id);
      setSelectedDriver(existing.driver?._id || existing.driverId);
      setPickupDate(
        existing.pickupDate
          ? new Date(existing.pickupDate).toISOString().split("T")[0]
          : ""
      );
      setPickupTime(existing.pickupTime || "");
      setDropDate(
        existing.dropDate
          ? new Date(existing.dropDate).toISOString().split("T")[0]
          : ""
      );
      setDropTime(existing.dropTime || "");
      setDriverRemarks(existing.remarks || "");
    } else {
      // If switching to a type that has NO existing allotment, reset to "New" mode
      // BUT keep the defaults derived from travelDetail if we haven't typed anything yet?
      // Simpler to just reset form if not editing, to avoid carrying over "Edit" state.
      // However, we want to keep the 'Travel Detail' defaults.
      // checkExistingAllotment is called on type change, so we should allow 'reset' behavior.
      // But we just called resetForm in the main useEffect.
      // For the secondary useEffect (type change), we need to be careful not to wipe user input if they just switched tabs?
      // For now, let's assume switching tabs resets to the state of that tab (Edit or New).
      if (
        type === "hotel" &&
        (!travelDetail.hotelAllotments ||
          travelDetail.hotelAllotments.length === 0)
      ) {
        setIsEditing(false);
        setCurrentAllotmentId(null);
        // Reset hotel fields to defaults
        setSelectedHotel("");
        setSelectedRoom("");
        if (travelDetail.arrivalDate)
          setCheckInDate(
            new Date(travelDetail.arrivalDate).toISOString().split("T")[0]
          );
        setCheckOutDate("");
        setHotelRemarks("");
      } else if (
        type === "driver" &&
        (!travelDetail.driverAllotments ||
          travelDetail.driverAllotments.length === 0)
      ) {
        setIsEditing(false);
        setCurrentAllotmentId(null);
        setSelectedDriver("");
        if (travelDetail.arrivalDate)
          setPickupDate(
            new Date(travelDetail.arrivalDate).toISOString().split("T")[0]
          );
        if (travelDetail.arrivalTime) setPickupTime(travelDetail.arrivalTime);
        setDropDate("");
        setDropTime("");
        setDriverRemarks("");
      }
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchHotelRooms = async (hotelId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/hotels/${hotelId}/rooms/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const availableRooms = data.data;
        setRooms(availableRooms);
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  const handleHotelChange = (hotelId) => {
    setSelectedHotel(hotelId);
    // If we are editing and changing hotel, we might lose the selected room if it's not in the new hotel.
    // Generally assume room needs re-selection.
    setSelectedRoom("");
    setRooms([]);
    if (hotelId) {
      fetchHotelRooms(hotelId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (allotmentType === "hotel") {
        // Hotel allotment
        if (!selectedHotel || !selectedRoom || !checkInDate) {
          toast.error("Please fill in all required fields for hotel allotment");
          setLoading(false);
          return;
        }

        const url = isEditing
          ? `${API_BASE_URL}/hotels/allotments/${currentAllotmentId}`
          : `${API_BASE_URL}/hotels/allotments`;

        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hotelId: selectedHotel,
            roomId: selectedRoom,
            visitorId: travelDetail.visitorId,
            visitorName: travelDetail.visitorName,
            visitorNumber: travelDetail.mobileNumber,
            checkInDate: new Date(checkInDate).toISOString(),
            checkOutDate: checkOutDate
              ? new Date(checkOutDate).toISOString()
              : null,
            remarks: hotelRemarks,
          }),
        });

        if (response.ok) {
          toast.success(
            isEditing
              ? "Hotel allotment updated successfully!"
              : "Hotel room allotted successfully!"
          );
          onClose();
          // Ideally trigger a refresh in parent, but onClose usually suffices if parent fetches on focus or we can pass a refresh callback.
          // window.location.reload(); // Too heavy.
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to save hotel allotment");
        }
      } else {
        // Driver allotment
        if (!selectedDriver || !pickupDate || !pickupTime) {
          toast.error(
            "Please fill in all required fields for driver allotment"
          );
          setLoading(false);
          return;
        }

        const url = isEditing
          ? `${API_BASE_URL}/drivers/allotments/${currentAllotmentId}`
          : `${API_BASE_URL}/drivers/allotments`;

        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driverId: selectedDriver,
            visitorId: travelDetail.visitorId,
            visitorName: travelDetail.visitorName,
            visitorNumber: travelDetail.mobileNumber,
            pickupDate: new Date(pickupDate).toISOString(),
            pickupTime: pickupTime,
            dropDate: dropDate ? new Date(dropDate).toISOString() : null,
            dropTime: dropTime || null,
            remarks: driverRemarks,
          }),
        });

        if (response.ok) {
          toast.success(
            isEditing
              ? "Driver allotment updated successfully!"
              : "Driver allotted successfully!"
          );
          onClose();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to save driver allotment");
        }
      }
    } catch (error) {
      console.error("Error saving allotment:", error);
      toast.error("Error saving allotment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? "Edit Allotment" : "New Allotment"} for{" "}
            {travelDetail?.visitorName}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Travel Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Travel Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Visitor ID:</span>{" "}
                  {travelDetail?.visitorId}
                </div>
                <div>
                  <span className="font-medium">Mobile:</span>{" "}
                  {travelDetail?.mobileNumber}
                </div>
                <div>
                  <span className="font-medium">Travel By:</span>{" "}
                  {travelDetail?.travelBy}
                </div>
                <div>
                  <span className="font-medium">From:</span>{" "}
                  {travelDetail?.fromLocation}
                </div>
                <div>
                  <span className="font-medium">To:</span>{" "}
                  {travelDetail?.toLocation}
                </div>
                <div>
                  <span className="font-medium">Arrival:</span>{" "}
                  {new Date(travelDetail?.arrivalDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allotment Type Selection */}
          <div className="mb-6">
            <Label className="text-base font-medium">Allotment Type</Label>
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant={allotmentType === "hotel" ? "default" : "outline"}
                onClick={() => setAllotmentType("hotel")}
                className="flex items-center gap-2"
              >
                <Hotel className="h-4 w-4" />
                Hotel Allotment
              </Button>
              <Button
                type="button"
                variant={allotmentType === "driver" ? "default" : "outline"}
                onClick={() => setAllotmentType("driver")}
                className="flex items-center gap-2"
              >
                <Car className="h-4 w-4" />
                Driver Allotment
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {allotmentType === "hotel" ? (
              <>
                {/* Hotel Allotment Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hotel">Select Hotel *</Label>
                    <select
                      id="hotel"
                      value={selectedHotel}
                      onChange={(e) => handleHotelChange(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id.toString()}>
                          {hotel.hotelName} ({hotel.hotelId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="room">Select Room *</Label>
                    <select
                      id="room"
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      disabled={!selectedHotel}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Choose room</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id.toString()}>
                          {room.roomNumber} ({room.categoryName}) -{" "}
                          {room.availableSlots} slot
                          {room.availableSlots > 1 ? "s" : ""} available
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkInDate">Check-in Date *</Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hotelRemarks">Remarks</Label>
                  <Textarea
                    id="hotelRemarks"
                    value={hotelRemarks}
                    onChange={(e) => setHotelRemarks(e.target.value)}
                    rows={3}
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </>
            ) : (
              <>
                {/* Driver Allotment Form */}
                <div>
                  <Label htmlFor="driver">Select Driver *</Label>
                  <select
                    id="driver"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id.toString()}>
                        {driver.driverName} - {driver.vehicleNumber} (
                        {driver.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupDate">Pickup Date *</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupTime">Pickup Time *</Label>
                    <Input
                      id="pickupTime"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dropDate">Drop Date</Label>
                    <Input
                      id="dropDate"
                      type="date"
                      value={dropDate}
                      onChange={(e) => setDropDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropTime">Drop Time</Label>
                    <Input
                      id="dropTime"
                      type="time"
                      value={dropTime}
                      onChange={(e) => setDropTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="driverRemarks">Remarks</Label>
                  <Textarea
                    id="driverRemarks"
                    value={driverRemarks}
                    onChange={(e) => setDriverRemarks(e.target.value)}
                    rows={3}
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
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
                  : isEditing
                  ? "Update Allotment"
                  : "Allot"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TravelAllotmentModal;
