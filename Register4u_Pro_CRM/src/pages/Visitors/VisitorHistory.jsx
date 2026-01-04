
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { visitorAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const VisitorHistory = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await visitorAPI.getHistory(id);
        if (res?.data?.success) {
          setEvents(res.data.data || []);
        } else if (res?.data) {
          setEvents(res.data.data || []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error fetching visitor history:", err);
        setError("Unable to fetch history. Backend may not expose this endpoint yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/visitors/view/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Visitor History</h1>
            <p className="text-sm text-gray-600 mt-1">Events for visitor ID: {id}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!error && events.length === 0 && (
            <p className="text-sm text-gray-600">No history found for this visitor.</p>
          )}

          <ul className="space-y-4">
            {events.map((ev) => (
              <li key={ev._id || ev.id} className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">{ev.type || ev.event || "event"}</div>
                    <div className="font-medium">{ev.message || ev.details || ev.description || ev.info || "-"}</div>
                    <div className="text-xs text-gray-500">By: {ev.byName || ev.by || ev.actor || "system"} • {ev.location || ev.place || "-"}</div>
                  </div>
                  <div className="text-xs text-gray-500">{formatDateTime(ev.createdAt || ev.timestamp || ev.time)}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div>
        <Link to="/visitors">
          <Button>Back to Visitors</Button>
        </Link>
      </div>
    </div>
  );
};

export default VisitorHistory;
