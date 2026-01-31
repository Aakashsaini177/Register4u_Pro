import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { organizationAPI } from "@/lib/api";
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
  BuildingOfficeIcon,
  MapPinIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "@/lib/utils";

const ViewOrganization = () => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchOrganization();
  }, [id]);

  const fetchOrganization = async () => {
    try {
      const response = await organizationAPI.getById(id);
      if (response.data.success) {
        setOrganization(response.data.data);
      } else {
        toast.error("Organization not found");
        navigate("/organization");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch organization details");
      navigate("/organization");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Organization",
      message:
        "Are you sure you want to delete this organization? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await organizationAPI.delete(id);
      if (response.data.success) {
        toast.success("Organization deleted successfully");
        navigate("/organization");
      } else {
        toast.error("Failed to delete organization");
      }
    } catch (error) {
      toast.error("Failed to delete organization");
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/organization">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organization Details
            </h1>
            <p className="text-gray-600 mt-1">{organization?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/organization/edit/${id}`}>
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

      {/* Organization details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Organization ID</p>
                <p className="text-base font-medium">{organization?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organization Type</p>
                <Badge variant="secondary">
                  {organization?.org_type || "General"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Organization Name</p>
                <p className="text-lg font-semibold">
                  {organization?.name || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-base font-medium">
                  {organization?.city || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-base font-medium">
                  {organization?.state || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="text-base font-medium">
                  {organization?.pincode || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-base font-medium">
                  {organization?.address || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdentificationIcon className="h-5 w-5" />
              Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">GSTIN</p>
                <p className="text-base font-medium font-mono">
                  {organization?.GSIJN || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CIN</p>
                <p className="text-base font-medium font-mono">
                  {organization?.CIN || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record Information */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-base font-medium">
                {formatDateTime(organization?.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-base font-medium">
                {formatDateTime(organization?.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewOrganization;
