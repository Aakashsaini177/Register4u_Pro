import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  visitorAPI,
  getImageUrl,
  API_BASE_URL,
  SERVER_BASE_URL,
  hotelAPI,
  driverAPI,
  categoryAPI,
  travelAPI,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { useConfirm } from "@/hooks/useConfirm";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TicketIcon,
  ClockIcon,
  EyeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Hotel, Car, Calendar, Clock, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const ViewVisitor = () => {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelAllotments, setHotelAllotments] = useState([]);
  const [driverAllotments, setDriverAllotments] = useState([]);
  const [travelDetail, setTravelDetail] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { employee, isEmployee, isPermanentEmployee } = useAuthStore();
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchVisitor();
    fetchActivityHistory();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchActivityHistory = async () => {
    try {
      // Fetch visitor activity history (scans, updates, etc.)
      const response = await visitorAPI.getActivityHistory(id);
      if (response.data.success) {
        setActivityHistory(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching activity history:", error);
      // Don't show error toast as this is optional data
    }
  };

  const fetchVisitor = async () => {
    try {
      const response = await visitorAPI.getById(id);
      if (response.data.success) {
        const visitorData = response.data.data;
        setVisitor(visitorData);

        // Log view activity if employee is viewing
        if (isEmployee() && employee) {
          try {
            // Call a view logging endpoint (we'll create this)
            await visitorAPI.logView(id);
          } catch (logError) {
            // Don't show error for logging failure
            console.log("View logging failed:", logError);
          }
        }

        // Fetch hotel and driver allotments using visitorId
        if (visitorData.visitorId) {
          await Promise.all([
            fetchHotelAllotments(visitorData.visitorId),
            fetchDriverAllotments(visitorData.visitorId),
            fetchTravelDetail(visitorData.visitorId),
          ]);
        }
      } else {
        toast.error("Visitor not found");
        navigate("/visitors");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch visitor details");
      navigate("/visitors");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelAllotments = async (visitorId) => {
    try {
      const response = await hotelAPI.getAllotmentsByVisitorId(visitorId);
      if (response.data.success) {
        // Only show the latest allotment (first one since backend sorts by createdAt desc)
        const allotments = response.data.data || [];
        setHotelAllotments(allotments.length > 0 ? [allotments[0]] : []);
      }
    } catch (error) {
      // Silently handle 404 - visitor might not have hotel allotments
      if (error.response?.status !== 404) {
        console.error("Error fetching hotel allotments:", error);
      }
      setHotelAllotments([]);
    }
  };

  const fetchDriverAllotments = async (visitorId) => {
    try {
      const response = await driverAPI.getAllotmentsByVisitorId(visitorId);
      if (response.data.success) {
        // Only show the latest allotment (first one since backend sorts by pickupDate desc)
        const allotments = response.data.data || [];
        setDriverAllotments(allotments.length > 0 ? [allotments[0]] : []);
      }
    } catch (error) {
      // Silently handle 404 - visitor might not have driver allotments
      if (error.response?.status !== 404) {
        console.error("Error fetching driver allotments:", error);
      }
      setDriverAllotments([]);
    }
  };

  const fetchTravelDetail = async (visitorId) => {
    try {
      const response = await travelAPI.getByVisitorId(visitorId);
      if (response.data.success) {
        setTravelDetail(response.data.data);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching travel details:", error);
      }
      setTravelDetail(null);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Visitor",
      message:
        "Are you sure you want to delete this visitor? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await visitorAPI.delete(id);
      if (response.data.success) {
        toast.success("Visitor deleted successfully");
        navigate("/visitors");
      } else {
        toast.error("Failed to delete visitor");
      }
    } catch (error) {
      toast.error("Failed to delete visitor");
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      {/* Enhanced Header with Visitor Profile */}
      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Back Button */}
            <Link to="/visitors">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>

            {/* Visitor Photo */}
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <VisitorAvatar
                photo={visitor?.photo}
                name={visitor?.name}
                visitorId={visitor?.visitorId || visitor?.id}
                className="w-full h-full rounded-full"
              />
            </div>

            {/* Visitor Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {visitor?.name || "Visitor Details"}
              </h1>
              <p className="text-indigo-100 text-lg mt-1">
                {visitor?.companyName || "No Company"} •{" "}
                {categories.find(
                  (c) =>
                    c.id === visitor?.category ||
                    c._id === visitor?.category ||
                    c.categoryId === visitor?.category,
                )?.name ||
                  visitor?.category ||
                  "General"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-indigo-100">
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {visitor?.visitorId || `#${id}`}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon className="h-3 w-3" />
                  {visitor?.contact || "No Contact"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  {visitor?.city || "No City"}
                </span>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="text-right">
              <div className="mb-4">
                <Badge
                  className={`${
                    visitor?.status === "checked-in"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  } text-sm px-3 py-1`}
                >
                  {visitor?.status === "checked-in"
                    ? "Checked In"
                    : "Registered"}
                </Badge>
              </div>

              {/* Current Employee Info */}
              {isEmployee() && employee && (
                <div className="text-xs text-indigo-100">
                  <p>Viewed by</p>
                  <p className="font-semibold">{employee.name}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Link to={`/visitors/history/${visitor?._id || id}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            History
          </Button>
        </Link>
      </div>

      {/* Visitor details - Single Column Layout */}
      <div className="space-y-6">
        {/* Assigned Services Section */}
        {(hotelAllotments.length > 0 ||
          driverAllotments.length > 0 ||
          (travelDetail && driverAllotments.length === 0)) && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Assigned Services
            </h2>

            {/* Hotel Allotment Card - Horizontal Profile Style */}
            {hotelAllotments.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Icon Circle */}
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Hotel className="h-10 w-10 text-white" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold">
                        {hotelAllotments[0].hotel?.hotelName || "N/A"}
                      </h3>
                      <p className="text-blue-100 text-lg mt-1">
                        {hotelAllotments[0].room?.roomNumber || "No Room"} •{" "}
                        {hotelAllotments[0].room?.category?.categoryName ||
                          "No Category"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                        {hotelAllotments[0].checkInDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            In:{" "}
                            {new Date(
                              hotelAllotments[0].checkInDate,
                            ).toLocaleDateString()}
                          </span>
                        )}
                        {hotelAllotments[0].checkOutDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Out:{" "}
                            {new Date(
                              hotelAllotments[0].checkOutDate,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-sm px-4 py-1">
                        {hotelAllotments[0].status || "Reserved"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Driver Allotment Card - Horizontal Profile Style */}
            {driverAllotments.length > 0 && (
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Icon Circle */}
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Car className="h-10 w-10 text-white" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold">
                        {driverAllotments[0].driver?.driverName || "N/A"}
                      </h3>
                      <p className="text-emerald-100 text-lg mt-1">
                        {driverAllotments[0].driver?.vehicleNumber ||
                          "No Vehicle"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-emerald-100">
                        <span className="flex items-center gap-1">
                          From: {travelDetail?.fromLocation || "N/A"}
                          {driverAllotments[0].pickupTime &&
                            ` (${driverAllotments[0].pickupTime})`}
                        </span>
                        <span className="flex items-center gap-1">
                          To: {travelDetail?.toLocation || "N/A"}
                          {driverAllotments[0].dropTime &&
                            ` (${driverAllotments[0].dropTime})`}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-sm px-4 py-1">
                        Assigned
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Travel Request Card */}
            {!driverAllotments.length > 0 && travelDetail && (
              <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-orange-300/30 pb-4">
                    <MapPin className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold">Travel Request</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-orange-100 mb-1">
                        Pickup
                      </p>
                      <p className="text-lg font-bold text-white">
                        {travelDetail.fromLocation || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-100 mb-1">
                        Drop
                      </p>
                      <p className="text-lg font-bold text-white">
                        {travelDetail.toLocation || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-100 mb-1">
                        Date & Time
                      </p>
                      <p className="text-lg font-bold text-white">
                        {travelDetail.arrivalDate
                          ? new Date(
                              travelDetail.arrivalDate,
                            ).toLocaleDateString()
                          : "N/A"}
                        {travelDetail.arrivalTime
                          ? ` at ${travelDetail.arrivalTime}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-100 mb-1">
                        Status
                      </p>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                        Pending Allocation
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Record Information - Always Visible now */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-purple-400/30 pb-4">
              <ClockIcon className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold">Record Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-purple-100 mb-1">
                  Created At
                </p>
                <p className="text-lg font-bold text-white">
                  {formatDateTime(visitor?.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-100 mb-1">
                  Last Updated
                </p>
                <p className="text-lg font-bold text-white">
                  {formatDateTime(visitor?.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewVisitor;
