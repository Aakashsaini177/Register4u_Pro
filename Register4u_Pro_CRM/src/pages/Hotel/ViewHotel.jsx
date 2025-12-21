import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Bed,
  Users,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
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

const ViewHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchHotelDetails();
    }
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/hotels/${id}`,
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
      } else {
        toast.error("Failed to fetch hotel details");
        navigate("/hotel");
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      toast.error("Error fetching hotel details");
      navigate("/hotel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/hotels/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Hotel deleted successfully");
        navigate("/hotel");
      } else {
        toast.error("Failed to delete hotel");
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Error deleting hotel");
    }
  };

  const handleStatusUpdate = async (allotmentId, status) => {
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`))
      return;

    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/hotels/allotments/${allotmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        toast.success(`Status updated to ${status}`);
        fetchHotelDetails();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Hotel not found
        </h2>
        <Button onClick={() => navigate("/hotel")}>Back to Hotels</Button>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {hotel.hotelName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hotel Details • ID: {hotel.hotelId || `H${hotel.id}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/hotel/edit/${hotel.id}`)}
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

      {/* Hotel Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Hotel Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Hotel Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {hotel.hotelName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Person
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {hotel.contactPerson}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Number
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {hotel.contactNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Address
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                {hotel.hotelAddress}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={hotel.status === "active" ? "default" : "secondary"}
                >
                  {hotel.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(hotel.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories and Rooms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Categories & Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hotel.categories && hotel.categories.length > 0 ? (
              <div className="space-y-4">
                {hotel.categories.map((category, index) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.categoryName}
                      </h3>
                      <Badge variant="outline">
                        {category.occupancy} occupancy
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {category.numberOfRooms} rooms
                    </p>
                    {category.rooms && category.rooms.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Room Numbers:
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {category.rooms.map((room, roomIndex) => (
                            <Badge key={room.id} variant="secondary">
                              {room.roomNumber}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No categories found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Room Allotments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Room Allotments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hotel.allotments && hotel.allotments.length > 0 ? (
            <div className="space-y-4">
              {hotel.allotments.map((allotment, index) => (
                <div key={allotment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {allotment.visitorName}
                    </h3>
                    <Badge
                      variant={
                        allotment.status === "active" ? "default" : "secondary"
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
                      <span className="font-medium">Room:</span>{" "}
                      {allotment.room?.roomNumber}
                    </div>
                    <div>
                      <span className="font-medium">Check-in:</span>{" "}
                      {new Date(allotment.checkInDate).toLocaleDateString()}
                    </div>
                    {allotment.checkOutDate && (
                      <div>
                        <span className="font-medium">Check-out:</span>{" "}
                        {new Date(allotment.checkOutDate).toLocaleDateString()}
                      </div>
                    )}
                    {allotment.remarks && (
                      <div className="col-span-2">
                        <span className="font-medium">Remarks:</span>{" "}
                        {allotment.remarks}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 justify-end border-t pt-4">
                    {allotment.status === "booked" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() =>
                            handleStatusUpdate(allotment.id, "checked-in")
                          }
                        >
                          Mark Check-In
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            handleStatusUpdate(allotment.id, "cancelled")
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {allotment.status === "checked-in" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(allotment.id, "checked-out")
                        }
                      >
                        Mark Check-Out
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No room allotments found for this hotel.
              </p>
              <Button
                onClick={() => navigate(`/hotel/allotment/${hotel.id}`)}
                className="mt-4"
              >
                Manage Room Allotments
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewHotel;
