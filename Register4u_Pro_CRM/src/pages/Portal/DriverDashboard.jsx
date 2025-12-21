import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import ChangePasswordModal from "./ChangePasswordModal";
import { portalDashboardAPI } from "@/lib/portalApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";
const formatTime = (value) => (value ? value.toString().slice(0, 5) : "—");

import { usePortalSettingsStore } from "@/store/portalSettingsStore";

const PortalDriverDashboard = () => {
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
          portalDashboardAPI.driver(),
          portalDashboardAPI.driverStats(),
        ]);
        setData(profileRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error("Error loading driver portal data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const driver = data?.entity;
  const metrics = stats?.stats;
  const upcomingTrips = stats?.upcomingTrips || [];

  return (
    <PortalLayout
      title="Driver Portal"
      onChangePassword={() => setShowChangePassword(true)}
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        driver && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Trips
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {metrics?.totalTrips || 0}
                </p>
              </Card>
              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Today's Trips
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {metrics?.todayTrips || 0}
                </p>
              </Card>
            </div>

            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {driver.driverName}
                </h2>
                <Badge
                  variant={driver.status === "active" ? "success" : "secondary"}
                >
                  {driver.status?.toUpperCase()}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Driver ID
                  </p>
                  <p>{driver.driverId}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Contact Number
                  </p>
                  <p>{driver.contactNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Vehicle Number
                  </p>
                  <p>{driver.vehicleNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Vehicle Type
                  </p>
                  <p>{driver.vehicleType}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Seater Capacity
                  </p>
                  <p>{driver.seater}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Trips
              </h3>
              <div className="space-y-4">
                {driver.allotments?.length ? (
                  driver.allotments.map((allotment) => (
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
                          {allotment.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <p>Pickup Date: {formatDate(allotment.pickupDate)}</p>
                        <p>Pickup Time: {formatTime(allotment.pickupTime)}</p>
                        <p>Pickup: {allotment.pickupLocation || "—"}</p>
                        <p>Drop: {allotment.dropLocation || "—"}</p>
                        <p>Contact: {allotment.visitorNumber}</p>
                      </div>
                      {allotment.travel && (
                        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                          Travel Type: {allotment.travel.travelBy} • From{" "}
                          {allotment.travel.fromLocation} to{" "}
                          {allotment.travel.toLocation}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    कोई upcoming trip नहीं है।
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

export default PortalDriverDashboard;
