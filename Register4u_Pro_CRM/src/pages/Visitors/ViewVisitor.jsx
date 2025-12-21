import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { visitorAPI, getImageUrl } from "@/lib/api";
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
import { formatDateTime } from "@/lib/utils";

const ViewVisitor = () => {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisitor();
  }, [id]);

  const fetchVisitor = async () => {
    try {
      const response = await visitorAPI.getById(id);
      if (response.data.success) {
        setVisitor(response.data.data);
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

  const API_BASE_URL = "http://localhost:4002/api/v1";

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
