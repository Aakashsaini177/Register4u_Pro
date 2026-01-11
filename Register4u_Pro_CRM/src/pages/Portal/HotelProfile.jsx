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
  BuildingOfficeIcon,
  IdentificationIcon,
  CalendarIcon,
  MapPinIcon,
  KeyIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const HotelProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await portalDashboardAPI.hotel();
        setData(profileRes.data.data);
      } catch (error) {
        console.error("Error loading hotel profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hotel = data?.entity;

  if (loading) {
    return (
      <PortalLayout title="Hotel Profile">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title="Hotel Profile"
      onChangePassword={() => setShowChangePassword(true)}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{hotel?.hotelName || hotel?.name || "Hotel"}</h1>
                <p className="text-purple-100 mt-1">Hotel ID: {hotel?.hotelId || hotel?.loginId}</p>
              </div>
            </div>
            <Badge
              variant={hotel?.status === "active" ? "success" : "secondary"}
              className="bg-white/20 text-white border-white/30"
            >
              {hotel?.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hotel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" />
                Hotel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hotel Name</label>
                <p className="text-foreground font-medium">{hotel?.hotelName || hotel?.name || "Not set"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hotel ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <IdentificationIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-mono">{hotel?.hotelId || hotel?.loginId || "Not assigned"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <div className="flex items-center gap-2 mt-1">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{hotel?.contactPerson || "Not set"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{hotel?.contactNumber || hotel?.phone || "Not set"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={hotel?.status === "active" ? "success" : "secondary"}>
                    {hotel?.status?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Facilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Location & Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hotel?.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-foreground">{hotel.address}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Rooms</label>
                <div className="flex items-center gap-2 mt-1">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{hotel?.totalRooms || hotel?.roomCount || "Not specified"}</p>
                </div>
              </div>

              {hotel?.category && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hotel Category</label>
                  <p className="text-foreground capitalize">{hotel.category}</p>
                </div>
              )}

              {hotel?.amenities && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amenities</label>
                  <p className="text-foreground">{hotel.amenities}</p>
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
                <p className="text-foreground font-mono">{hotel?.loginId || "Not set"}</p>
              </div>

              {hotel?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{hotel.email}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {hotel?.createdAt ? new Date(hotel.createdAt).toLocaleDateString() : "Not available"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {hotel?.updatedAt ? new Date(hotel.updatedAt).toLocaleDateString() : "Not available"}
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
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                Refresh Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Room Statistics */}
        {hotel?.rooms && hotel.rooms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                Room Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {hotel.rooms.filter(room => room.status === 'available').length}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Available Rooms</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {hotel.rooms.filter(room => room.status === 'occupied').length}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Occupied Rooms</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {hotel.rooms.length}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total Rooms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tips */}
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Security Tips</h3>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
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

export default HotelProfile;