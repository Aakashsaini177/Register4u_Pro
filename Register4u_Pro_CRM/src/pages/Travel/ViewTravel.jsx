import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plane,
  Train,
  Car,
  Bus,
  Phone,
  Calendar,
  Clock,
  MapPin,
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
import { SERVER_BASE_URL } from "@/lib/api";
import { useConfirm } from "../../hooks/useConfirm";

const ViewTravel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [travel, setTravel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (id) {
      fetchTravelDetails();
    }
  }, [id]);

  const fetchTravelDetails = async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/travel/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTravel(data.data);
      } else {
        toast.error("Failed to fetch travel details");
        navigate("/travel");
      }
    } catch (error) {
      console.error("Error fetching travel details:", error);
      toast.error("Error fetching travel details");
      navigate("/travel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Travel Detail",
      message:
        "Are you sure you want to delete this travel detail? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/travel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Travel detail deleted successfully");
        navigate("/travel");
      } else {
        toast.error("Failed to delete travel detail");
      }
    } catch (error) {
      console.error("Error deleting travel detail:", error);
      toast.error("Error deleting travel detail");
    }
  };

  const getTravelIcon = (travelBy) => {
    switch (travelBy) {
      case "Flight":
        return <Plane className="h-5 w-5" />;
      case "Train":
        return <Train className="h-5 w-5" />;
      case "Car":
        return <Car className="h-5 w-5" />;
      case "Bus":
        return <Bus className="h-5 w-5" />;
      default:
        return <Plane className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!travel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Travel detail not found
        </h2>
        <Button onClick={() => navigate("/travel")}>Back to Travel</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {travel.visitorName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Travel Details</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/travel/edit/${travel.id}`)}
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

      {/* Travel Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Visitor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Visitor ID
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {travel.visitorId}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Visitor Name
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {travel.visitorName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Mobile Number
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {travel.mobileNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Type
              </label>
              <div className="mt-1">
                <Badge
                  variant={travel.type === "arrival" ? "default" : "secondary"}
                >
                  {travel.type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={
                    travel.status === "completed" ? "default" : "secondary"
                  }
                >
                  {travel.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTravelIcon(travel.travelBy)}
              Travel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Travel By
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                {getTravelIcon(travel.travelBy)}
                {travel.travelBy}
              </p>
            </div>
            {travel.flightTrainNo && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {travel.travelBy === "Flight"
                    ? "Flight Number"
                    : "Train Number"}
                </label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {travel.flightTrainNo}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                From Location
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {travel.fromLocation}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                To Location
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {travel.toLocation}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Arrival Date & Time
              </label>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(travel.arrivalDate).toLocaleDateString()}
              </p>
              <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2 ml-6">
                <Clock className="h-4 w-4" />
                {travel.arrivalTime}
              </p>
            </div>
            {travel.departureDate && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Departure Date & Time
                </label>
                <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(travel.departureDate).toLocaleDateString()}
                </p>
                {travel.departureTime && (
                  <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2 ml-6">
                    <Clock className="h-4 w-4" />
                    {travel.departureTime}
                  </p>
                )}
              </div>
            )}
            {travel.remarks && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Remarks
                </label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {travel.remarks}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hotel Allotments */}
        {travel.hotelAllotments && travel.hotelAllotments.length > 0 && (
          <Card className="mt-6 border-t-4 border-t-indigo-500 shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-indigo-700 dark:text-indigo-400">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                Hotel Allotments ({travel.hotelAllotments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {travel.hotelAllotments.map((allotment, index) => (
                  <div
                    key={allotment.id}
                    className="relative border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
                  >
                    {/* Hotel Header */}
                    <div className="bg-indigo-50 dark:bg-gray-700/50 p-4 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {allotment.hotel?.hotelName || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {allotment.hotel?.hotelAddress || "N/A"}
                        </p>
                      </div>
                      <Badge className="bg-white text-indigo-600 hover:bg-white border-indigo-200">
                        {allotment.room?.roomNumber
                          ? `Start: ${new Date(
                              allotment.checkInDate
                            ).toLocaleDateString()}`
                          : "Pending"}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Contact Info */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Contact
                        </label>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {allotment.hotel?.contactPerson || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {allotment.hotel?.contactNumber || "N/A"}
                        </p>
                      </div>

                      {/* Room Info */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Room Details
                        </label>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Room {allotment.room?.roomNumber || "TBD"}
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-0.5 rounded">
                          {allotment.room?.category?.categoryName || "Standard"}
                        </p>
                      </div>

                      {/* Check-in */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Check-in
                        </label>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="font-medium">
                            {allotment.checkInDate
                              ? new Date(
                                  allotment.checkInDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Check-out */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Check-out
                        </label>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                          <Calendar className="h-4 w-4 text-red-500" />
                          <span className="font-medium">
                            {allotment.checkOutDate
                              ? new Date(
                                  allotment.checkOutDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Driver Allotments */}
        {travel.driverAllotments && travel.driverAllotments.length > 0 && (
          <Card className="mt-6 border-t-4 border-t-emerald-500 shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-emerald-700 dark:text-emerald-400">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                Driver Allotments ({travel.driverAllotments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {travel.driverAllotments.map((allotment, index) => (
                  <div
                    key={allotment.id}
                    className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
                  >
                    {/* Driver Header */}
                    <div className="bg-emerald-50 dark:bg-gray-700/50 p-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {allotment.driver?.driverName || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {allotment.driver?.contactNumber || "N/A"}
                        </p>
                      </div>
                      <Badge className="bg-white text-emerald-600 hover:bg-white border-emerald-200">
                        {allotment.driver?.vehicleType || "Vehicle"}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Vehicle Info */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Vehicle
                        </label>
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-lg">
                          {allotment.driver?.vehicleNumber || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {allotment.driver?.seater || "4"} Seater
                        </p>
                      </div>

                      {/* Pickup Info */}
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Pickup Schedule
                        </label>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              {allotment.pickupDate
                                ? new Date(
                                    allotment.pickupDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              {allotment.pickupTime || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* License */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          License
                        </label>
                        <p className="font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block text-sm">
                          {allotment.driver?.licenseNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Allotments Message */}
        {(!travel.hotelAllotments || travel.hotelAllotments.length === 0) &&
          (!travel.driverAllotments ||
            travel.driverAllotments.length === 0) && (
            <Card className="mt-6">
              <CardContent className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No hotel or driver allotments found for this travel.
                </p>
                <Button onClick={() => navigate("/travel")} variant="outline">
                  Go to Travel List
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};

export default ViewTravel;
