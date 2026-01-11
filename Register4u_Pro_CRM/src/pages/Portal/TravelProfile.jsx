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
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const TravelProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await portalDashboardAPI.travel();
        setData(profileRes.data.data);
      } catch (error) {
        console.error("Error loading travel profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const travel = data?.entity;

  if (loading) {
    return (
      <PortalLayout title="Travel Profile">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title="Travel Profile"
      onChangePassword={() => setShowChangePassword(true)}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <MapPinIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{travel?.agentName || travel?.name || "Travel Agent"}</h1>
                <p className="text-green-100 mt-1">Agent ID: {travel?.agentId || travel?.loginId}</p>
              </div>
            </div>
            <Badge
              variant={travel?.status === "active" ? "success" : "secondary"}
              className="bg-white/20 text-white border-white/30"
            >
              {travel?.status?.toUpperCase() || "UNKNOWN"}
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
                <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
                <p className="text-foreground font-medium">{travel?.agentName || travel?.name || "Not set"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agent ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <IdentificationIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-mono">{travel?.agentId || travel?.loginId || "Not assigned"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{travel?.contactNumber || travel?.phone || "Not set"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={travel?.status === "active" ? "success" : "secondary"}>
                    {travel?.status?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agency Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" />
                Agency Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agency Name</label>
                <div className="flex items-center gap-2 mt-1">
                  <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{travel?.agencyName || "Not specified"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">License Number</label>
                <p className="text-foreground font-mono">{travel?.licenseNumber || "Not specified"}</p>
              </div>

              {travel?.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-foreground">{travel.address}</p>
                </div>
              )}

              {travel?.specialization && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Specialization</label>
                  <p className="text-foreground capitalize">{travel.specialization}</p>
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
                <p className="text-foreground font-mono">{travel?.loginId || "Not set"}</p>
              </div>

              {travel?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{travel.email}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {travel?.createdAt ? new Date(travel.createdAt).toLocaleDateString() : "Not available"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {travel?.updatedAt ? new Date(travel.updatedAt).toLocaleDateString() : "Not available"}
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

        {/* Travel Statistics */}
        {travel?.bookings && travel.bookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {travel.bookings.slice(0, 5).map((booking, index) => (
                  <div
                    key={booking.id || index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{booking.passengerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.fromLocation} → {booking.toLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {booking.status?.toUpperCase() || "PENDING"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "TBD"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tips */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Security Tips</h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
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

export default TravelProfile;