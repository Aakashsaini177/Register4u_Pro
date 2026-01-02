import React, { useState, useEffect } from "react";
import { X, Hotel, Calendar, MessageSquare, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { SERVER_BASE_URL } from "../../lib/api";

const HotelAllotmentModal = ({ isOpen, onClose, visitorData }) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  
  const [formData, setFormData] = useState({
    visitorId: "",
    visitorName: "",
    visitorNumber: "",
    checkInDate: "",
    checkOutDate: "",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchHotels();
      // Auto-fill visitor data
      if (visitorData) {
        setFormData({
          visitorId: visitorData.visitorId || "",
          visitorName: visitorData.name || "",
          visitorNumber: visitorData.contact || "",
          checkInDate: "",
          checkOutDate: "",
          remarks: "",
        });
      }
    }
  }, [isOpen, visitorData]);

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms(selectedHotel);
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to fetch hotels");
    }
  };

  const fetchRooms = async (hotelId) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const hotel = data.data;
        
        // Flatten all rooms from all categories
        const allRooms = [];
        hotel.categories?.forEach((category) => {
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
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedHotel || !selectedRoom || !formData.visitorId || !formData.checkInDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/hotels/allotments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelId: selectedHotel,
          roomId: selectedRoom,
          visitorId: formData.visitorId,
          visitorName: formData.visitorName,
          visitorNumber: formData.visitorNumber,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          remarks: formData.remarks,
        }),
      });

      if (response.ok) {
        toast.success("Hotel room allotted successfully!");
        onClose();
        // Reset form
        setFormData({
          visitorId: "",
          visitorName: "",
          visitorNumber: "",
          checkInDate: "",
          checkOutDate: "",
          remarks: "",
        });
        setSelectedHotel("");
        setSelectedRoom("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to allot hotel room");
      }
    } catch (error) {
      console.error("Error allotting hotel room:", error);
      toast.error("Failed to allot hotel room");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Hotel className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Hotel Allotment
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Visitor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visitor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="visitorId">Visitor ID *</Label>
                  <Input
                    id="visitorId"
                    value={formData.visitorId}
                    onChange={(e) => handleInputChange("visitorId", e.target.value)}
                    placeholder="Enter visitor ID"
                    required
                    readOnly={!!visitorData?.visitorId}
                    className={visitorData?.visitorId ? "bg-gray-100" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="visitorName">Visitor Name *</Label>
                  <Input
                    id="visitorName"
                    value={formData.visitorName}
                    onChange={(e) => handleInputChange("visitorName", e.target.value)}
                    placeholder="Enter visitor name"
                    required
                    readOnly={!!visitorData?.name}
                    className={visitorData?.name ? "bg-gray-100" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="visitorNumber">Contact Number</Label>
                  <Input
                    id="visitorNumber"
                    value={formData.visitorNumber}
                    onChange={(e) => handleInputChange("visitorNumber", e.target.value)}
                    placeholder="Enter contact number"
                    readOnly={!!visitorData?.contact}
                    className={visitorData?.contact ? "bg-gray-100" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel & Room Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hotel & Room Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hotel">Select Hotel *</Label>
                  <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel._id} value={hotel._id}>
                          {hotel.hotelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room">Select Room *</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedHotel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.roomNumber} - {room.categoryName} ({room.occupancy} occupancy)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check-in/Check-out Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Check-in & Check-out
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInDate">Check-in Date *</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutDate">Check-out Date</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => handleInputChange("checkOutDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <div>
            <Label htmlFor="remarks" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Enter any additional remarks..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Allotting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Allot Hotel Room
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelAllotmentModal;