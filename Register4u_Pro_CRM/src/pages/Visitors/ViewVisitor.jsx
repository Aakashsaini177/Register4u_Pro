import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { visitorAPI, getImageUrl, API_BASE_URL, SERVER_BASE_URL, hotelAPI, driverAPI } from "@/lib/api";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
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
} from "@heroicons/react/24/outline";
import { Hotel, Car, Calendar, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const ViewVisitor = () => {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelAllotments, setHotelAllotments] = useState([]);
  const [driverAllotments, setDriverAllotments] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisitor();
  }, [id]);

  const fetchVisitor = async () => {
    try {
      const response = await visitorAPI.getById(id);
      if (response.data.success) {
        const visitorData = response.data.data;
        setVisitor(visitorData);
        
        // Fetch hotel and driver allotments using visitorId
        if (visitorData.visitorId) {
          await Promise.all([
            fetchHotelAllotments(visitorData.visitorId),
            fetchDriverAllotments(visitorData.visitorId)
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this visitor?")) {
      return;
    }

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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/visitors">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Visitor Details
            </h1>
            <p className="text-gray-600 mt-1">
              {visitor?.visitorId || `#${id}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/visitors/card/${visitor?.visitorId || id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              View ID Card
            </Button>
          </Link>
          <Link to={`/visitors/history/${visitor?._id || id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              History
            </Button>
          </Link>
          <Link to={`/visitors/edit/${id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Visitor details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Visitor ID</p>
                  <p className="text-base font-medium">
                    {visitor?.visitorId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge variant="secondary">
                    {visitor?.category || "General"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-base font-medium">
                    {visitor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-base font-medium">
                    {visitor?.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-base font-medium">
                      {visitor?.contact || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-base font-medium">
                      {visitor?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-base font-medium">
                      {visitor?.city || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profession</p>
                  <p className="text-base font-medium">
                    {visitor?.professions || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" />
                Company & Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="text-base font-medium">
                    {visitor?.companyName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket Number</p>
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-base font-medium">
                      {visitor?.ticket || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hostess</p>
                  <p className="text-base font-medium">
                    {visitor?.hostess || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Allotments */}
          {hotelAllotments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-blue-600" />
                  Hotel Allotment (Latest)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Hotel Name</p>
                      <p className="text-base font-medium">
                        {hotelAllotments[0].hotel?.hotelName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Number</p>
                      <p className="text-base font-medium">
                        {hotelAllotments[0].room?.roomNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Category</p>
                      <p className="text-base font-medium">
                        {hotelAllotments[0].room?.category?.categoryName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant={hotelAllotments[0].status === 'booked' ? 'default' : 'secondary'}>
                        {hotelAllotments[0].status || "N/A"}
                      </Badge>
                    </div>
                    {hotelAllotments[0].checkInDate && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Check-in Date
                        </p>
                        <p className="text-base font-medium">
                          {new Date(hotelAllotments[0].checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {hotelAllotments[0].checkOutDate && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Check-out Date
                        </p>
                        <p className="text-base font-medium">
                          {new Date(hotelAllotments[0].checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {hotelAllotments[0].remarks && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-base font-medium">{hotelAllotments[0].remarks}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driver Allotments */}
          {driverAllotments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-green-600" />
                  Driver Allotment (Latest)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Driver Name</p>
                      <p className="text-base font-medium">
                        {driverAllotments[0].driver?.driverName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="text-base font-medium">
                        {driverAllotments[0].driver?.contactNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Number</p>
                      <p className="text-base font-medium">
                        {driverAllotments[0].driver?.vehicleNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="text-base font-medium">
                        {driverAllotments[0].driver?.vehicleType || "N/A"} ({driverAllotments[0].driver?.seater || "N/A"} seater)
                      </p>
                    </div>
                    {driverAllotments[0].pickupDate && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Pickup Date
                        </p>
                        <p className="text-base font-medium">
                          {new Date(driverAllotments[0].pickupDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {driverAllotments[0].pickupTime && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Pickup Time
                        </p>
                        <p className="text-base font-medium">
                          {driverAllotments[0].pickupTime}
                        </p>
                      </div>
                    )}
                    {driverAllotments[0].dropDate && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Drop Date
                        </p>
                        <p className="text-base font-medium">
                          {new Date(driverAllotments[0].dropDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {driverAllotments[0].dropTime && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Drop Time
                        </p>
                        <p className="text-base font-medium">
                          {driverAllotments[0].dropTime}
                        </p>
                      </div>
                    )}
                  </div>
                  {driverAllotments[0].remarks && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-base font-medium">{driverAllotments[0].remarks}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo & Barcode */}
          <Card>
            <CardHeader>
              <CardTitle>Visitor Badge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-600 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <VisitorAvatar
                    photo={visitor?.photo}
                    name={visitor?.name}
                    visitorId={visitor?.visitorId || visitor?.id}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Visitor ID Badge */}
              <div className="text-center">
                <div className="inline-block bg-indigo-100 px-4 py-2 rounded-full">
                  <p className="text-xl font-bold text-indigo-900">
                    {visitor?.visitorId || visitor?.id}
                  </p>
                </div>
              </div>

              {/* Barcode */}
              {visitor?.visitorId && (
                <div className="bg-white p-2 rounded border">
                  <img
                    src={`${API_BASE_URL}/barcode/${visitor.visitorId}`}
                    alt="Barcode"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* View Card Button */}
              <Link to={`/visitors/card/${visitor?.visitorId || id}`}>
                <Button className="w-full">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  View Full ID Card
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-base font-medium">
                  {formatDateTime(visitor?.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-base font-medium">
                  {formatDateTime(visitor?.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewVisitor;
