import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import ChangePasswordModal from "./ChangePasswordModal";
import { portalDashboardAPI } from "@/lib/portalApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import { usePortalSettingsStore } from "@/store/portalSettingsStore";

const PortalHotelDashboard = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { fetchSettings } = usePortalSettingsStore();

  useEffect(() => {
    fetchSettings();
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          portalDashboardAPI.hotel(),
          portalDashboardAPI.hotelStats(),
        ]);

        setData(profileRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error("Error loading hotel portal data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hotel = data?.entity;
  const metrics = stats?.stats;
  const recentGuests = stats?.recentGuests || [];

  return (
    <PortalLayout
      title="Hotel Portal"
      onChangePassword={() => setShowChangePassword(true)}
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        hotel && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Rooms
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {metrics?.totalRooms || 0}
                </p>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Occupied
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {metrics?.occupiedRooms || 0}
                </p>
              </Card>
              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Today's Check-ins
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {metrics?.todayCheckIns || 0}
                </p>
              </Card>
              <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Available
                </p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {metrics?.availableRooms || 0}
                </p>
              </Card>
            </div>

            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {hotel.hotelName}
                </h2>
                <Badge
                  variant={hotel.status === "active" ? "success" : "secondary"}
                >
                  {hotel.status?.toUpperCase()}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Hotel ID
                  </p>
                  <p>{hotel.hotelId}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Contact Person
                  </p>
                  <p>{hotel.contactPerson}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Contact Number
                  </p>
                  <p>{hotel.contactNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Address
                  </p>
                  <p>{hotel.hotelAddress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Room Categories
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {hotel.categories?.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {category.categoryName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Occupancy: {category.occupancy}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Rooms: {category.numberOfRooms}
                    </p>
                    <div className="mt-3">
                      <p className="text-xs uppercase text-gray-400 dark:text-gray-500 mb-1">
                        Room Numbers
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {category.rooms?.map((room) => (
                          <span
                            key={room.id}
                            className="px-2 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded"
                          >
                            {room.roomNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Room Allotments
              </h3>
              <div className="space-y-4">
                {hotel.allotments?.length ? (
                  hotel.allotments.map((allotment) => (
                    <div
                      key={allotment.id}
                      className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {allotment.visitorName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Visitor ID: {allotment.visitorId}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Room {allotment.room?.roomNumber}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <p>
                          Check-in:{" "}
                          {allotment.checkInDate &&
                            new Date(
                              allotment.checkInDate
                            ).toLocaleDateString()}
                        </p>
                        <p>
                          Check-out:{" "}
                          {allotment.checkOutDate &&
                            new Date(
                              allotment.checkOutDate
                            ).toLocaleDateString()}
                        </p>
                        <p>Contact: {allotment.visitorNumber}</p>
                        <p>Status: {allotment.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    अभी कोई allotment नहीं है।
                  </p>
                )}
              </div>
            </Card>
          </div>
        )
      )}

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </PortalLayout>
  );
};

export default PortalHotelDashboard;
