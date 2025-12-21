import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { eventAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

const ViewEvent = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getById(id);
      if (response.data.success) {
        setEvent(response.data.data);
      } else {
        toast.error("Event not found");
        navigate("/event");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch event details");
      navigate("/event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await eventAPI.delete(id);
      if (response.data.success) {
        toast.success("Event deleted successfully");
        navigate("/event");
      } else {
        toast.error("Failed to delete event");
      }
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "upcoming":
        return "info";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/event">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
            <p className="text-gray-600 mt-1">
              {event?.eventName || event?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/event/edit/${id}`}>
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

      {/* Event details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Event ID</p>
                <p className="text-base font-medium">{event?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={getStatusColor(event?.status)}>
                  {event?.status || "Active"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Event Name</p>
                <p className="text-lg font-semibold">
                  {event?.eventName || event?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="text-base font-medium">
                  {formatDateTime(event?.StartTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Time</p>
                <p className="text-base font-medium">
                  {formatDateTime(event?.EndTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Organizer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Location & Organizer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium">
                    {event?.location || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organizer</p>
                <p className="text-base font-medium">
                  {event?.organizer || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organization ID</p>
                <p className="text-base font-medium">{event?.orgId || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-base font-medium">
                  {formatDateTime(event?.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-base font-medium">
                  {formatDateTime(event?.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Registration QR Code */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5" />
              Public Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <QRCodeSVG
                value={`${window.location.origin}/register`}
                size={150}
                level="H"
              />
            </div>
            <div className="text-center w-full">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Scan to Register
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/register`
                    );
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  Copy Link
                </Button>
                <Link to="/register" target="_blank">
                  <Button variant="secondary" size="sm" className="w-full">
                    Open Form
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewEvent;
