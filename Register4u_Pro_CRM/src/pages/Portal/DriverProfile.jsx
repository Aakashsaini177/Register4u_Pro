import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import ChangePasswordModal from "./ChangePasswordModal";
import { portalDashboardAPI } from "@/lib/portalApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import {
  UserIcon,
  PhoneIcon,
  TruckIcon,
  IdentificationIcon,
  CalendarIcon,
  MapPinIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const DriverProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await portalDashboardAPI.driver();
        setData(profileRes.data.data);
      } catch (error) {
        console.error("Error loading driver profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const driver = data?.entity;

  if (loading) {
    return (
      <PortalLayout title="Driver Profile">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title="Driver Profile"
      onChangePassword={() => setShowChangePassword(true)}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{driver?.driverName || "Driver"}</h1>
                <p className="text-blue-100 mt-1">Driver ID: {driver?.driverId}</p>
              </div>
            </div>
            <Badge
              variant={driver?.status === "active" ? "success" : "secondary"}
              className="bg-white/20 text-white border-white/30"
            >
              {driver?.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-foreground font-medium">{driver?.driverName || "Not set"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Driver ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <IdentificationIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-mono">{driver?.driverId || "Not assigned"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{driver?.contactNumber || "Not set"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={driver?.status === "active" ? "success" : "secondary"}>
                    {driver?.status?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicle Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <TruckIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-mono">{driver?.vehicleNumber || "Not assigned"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                <p className="text-foreground capitalize">{driver?.vehicleType || "Not specified"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Seating Capacity</label>
                <p className="text-foreground">{driver?.seater ? `${driver.seater} seats` : "Not specified"}</p>
              </div>

              {driver?.licenseNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">License Number</label>
                  <p className="text-foreground font-mono">{driver.licenseNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdentificationIcon className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Login ID</label>
                <p className="text-foreground font-mono">{driver?.loginId || "Not set"}</p>
              </div>

              {driver?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{driver.email}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {driver?.createdAt ? new Date(driver.createdAt).toLocaleDateString() : "Not available"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {driver?.updatedAt ? new Date(driver.updatedAt).toLocaleDateString() : "Not available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="outline"
                className="w-full justify-start"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Change Password
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full justify-start"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Refresh Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trip Statistics */}
        {driver?.allotments && driver.allotments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Recent Trip Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {driver.allotments.slice(0, 5).map((allotment, index) => (
                  <div
                    key={allotment.id || index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{allotment.visitorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {allotment.pickupLocation} → {allotment.dropLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {allotment.status?.toUpperCase() || "PENDING"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {allotment.pickupDate ? new Date(allotment.pickupDate).toLocaleDateString() : "TBD"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tips */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Security Tips</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Change your password regularly</li>
              <li>• Don't share your login credentials</li>
              <li>• Log out when finished</li>
              <li>• Report any suspicious activity</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </PortalLayout>
  );
};

export default DriverProfile;