import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import ChangePasswordModal from "./ChangePasswordModal";
import { portalDashboardAPI } from "@/lib/portalApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const PortalTravelDashboard = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          portalDashboardAPI.travel(),
          portalDashboardAPI.travelStats(),
        ]);
        setData(profileRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error("Error loading travel portal data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const travel = data?.entity;
  const metrics = stats?.stats;
  const pendingRequests = stats?.pendingRequests || [];

  // Safe checks for existing travel details (if this account is associated with a specific travel record)
  // But typically Travel Desk sees ALL request overview, so 'travel' entity might just be the account detail?
  // Let's assume Travel Portal Account might NOT have a single entity associated if general admin.
  // But controller expects 'entityId'. If it's a specific traveller, they see their details.
  // If it's the Travel DESK, they should see overview.
  // The current controller `getTravelDashboardStats` assumes Travel Desk Role logic (aggregates everything).
  // But `getProfile` assumes specific TravelDetail entity.
  // Let's display the stats which are more relevant for the Desk Dashboard.

  return (
    <PortalLayout
      title="Travel Portal"
      onChangePassword={() => setShowChangePassword(true)}
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Today's Arrivals
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {metrics?.todayArrivals || 0}
              </p>
            </Card>
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Today's Departures
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {metrics?.todayDepartures || 0}
              </p>
            </Card>
            <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Pending Allocations
              </p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {metrics?.pendingCount || 0}
              </p>
            </Card>
          </div>

          {/* Travel Desk often needs to see Pending Requests */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Requests
              </h3>
            </div>
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {req.visitorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {req.type === "arrival" ? "Arrival" : "Departure"} •{" "}
                        {new Date(req.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = `/travel/view/${req.id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No pending requests.</p>
              )}
            </div>
          </Card>

          {travel && (
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Account Details
                </h2>
                <Badge variant="outline">
                  {travel.status?.toUpperCase() || "ACTIVE"}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                {/* Only show if relevant data exists */}
                {travel.visitorName && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Name
                    </p>
                    <p>{travel.visitorName}</p>
                  </div>
                )}
                {travel.mobileNumber && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Contact
                    </p>
                    <p>{travel.mobileNumber}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </PortalLayout>
  );
};

export default PortalTravelDashboard;
