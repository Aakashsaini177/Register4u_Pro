import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import { portalDashboardAPI } from "@/lib/portalApi"; // We might need to add getVisitors here
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Note: You might need to add 'getHotelVisitors' to portalApi.js first.
// For now, I'll assume we can filter generic visitors or use a specific endpoint.
// Actually, let's update portalApi.js in the next step to support this.

const PortalHotelVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, checked-in, upcoming

  useEffect(() => {
    // Placeholder for fetching data
    // Ideally: portalDashboardAPI.getHotelVisitors()
    // For now we will mock or wait for API update
    const fetchVisitors = async () => {
      setLoading(true);
      try {
        // We need to implement this endpoint or reuse existing stats one?
        // Existing stats only gives counts and top 5 recent.
        // We need a full list.
        const response = await portalDashboardAPI.getHotelVisitors();
        if (response.data.success) {
          setVisitors(response.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  const filteredVisitors = visitors.filter((v) => {
    if (filter === "all") return true;
    if (filter === "checked-in") return v.status === "checked-in";
    if (filter === "upcoming") return v.status === "allotted"; // Assuming 'allotted' is status
    return true;
  });

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Guest List
            </h2>
            <p className="text-gray-500">Manage your hotel guests</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "checked-in" ? "default" : "outline"}
              onClick={() => setFilter("checked-in")}
            >
              Checked In
            </Button>
            <Button
              variant={filter === "upcoming" ? "default" : "outline"}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </Button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid gap-4">
            {filteredVisitors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No guests found with this filter.
                </CardContent>
              </Card>
            ) : (
              filteredVisitors.map((guest) => (
                <Card key={guest.id}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {guest.visitorName}
                        </h3>
                        <p className="text-sm font-mono text-gray-500 bg-gray-100 rounded px-1 w-fit mb-1">
                          {guest.visitorId}
                        </p>
                        <p className="text-sm text-gray-500">
                          Room: {guest.room?.roomNumber || "Not Assigned"}
                        </p>
                        <div className="flex gap-2 text-sm mt-1">
                          <span>
                            Check-in:{" "}
                            {new Date(guest.checkInDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            Check-out:{" "}
                            {new Date(guest.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          guest.status === "checked-in" ? "success" : "warning"
                        }
                      >
                        {guest.status}
                      </Badge>
                      {guest.status === "upcoming" && (
                        <div className="mt-2">
                          <Button size="sm">Check In</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalHotelVisitors;
