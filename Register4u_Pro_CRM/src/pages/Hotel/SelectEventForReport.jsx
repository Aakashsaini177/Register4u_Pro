import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import {
  CalendarIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "@/lib/utils"; // Assuming this utility exists

const SelectEventForReport = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch all events. Assuming getAll accepts pagination or returns all if empty
      const res = await eventAPI.getAll({ page: 1, limit: 100 });
      if (res.data.success) {
        setEvents(res.data.data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotel Reports</h1>
          <p className="text-sm text-gray-500">
            Select an event to view its hotel reports or view a general summary.
          </p>
        </div>
      </div>

      {/* General Summary Option */}
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500 bg-green-50/50 mb-8"
        onClick={() => navigate(`/hotel/reports/general`)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
            General Hotel Summary (All Hotels)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            View the master summary of all hotels and their total inventory,
            without selecting a specific event. Used rooms will be 0.
          </p>
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            variant="default"
          >
            View Master Summary
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-800">
          Event Specific Reports
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <Card
              key={event._id}
              className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500"
              onClick={() => navigate(`/hotel/reports/${event._id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {event.eventName}
                </CardTitle>
                <span
                  className={`text-xs px-2 py-1 rounded-full w-fit ${
                    event.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.status}
                </span>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDateTime(event.StartTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Reports
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No events found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectEventForReport;
