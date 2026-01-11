
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { visitorAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import { formatDateTime } from "@/lib/utils";
import { 
  ArrowLeftIcon, 
  UserIcon, 
  EyeIcon, 
  PencilIcon, 
  PrinterIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

const VisitorHistory = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both visitor details and history
        const [historyRes, visitorRes] = await Promise.all([
          visitorAPI.getHistory(id),
          visitorAPI.getById(id)
        ]);

        if (historyRes?.data?.success) {
          setEvents(historyRes.data.data || []);
        }

        if (visitorRes?.data?.success) {
          setVisitor(visitorRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching visitor data:", err);
        setError("Unable to fetch history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'scan':
        return <QrCodeIcon className="h-4 w-4 text-green-600" />;
      case 'update':
        return <PencilIcon className="h-4 w-4 text-blue-600" />;
      case 'print':
        return <PrinterIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <EyeIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'scan':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'print':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Link to={`/visitors/view/${id}`}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>
            
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Activity History</h1>
              <p className="text-purple-100 text-lg mt-1">
                {visitor?.name || "Visitor"} • {visitor?.visitorId || id}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-purple-100">
                <UserIcon className="h-3 w-3" />
                <span>{visitor?.companyName || "No Company"}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-purple-100 text-sm">Total Activities</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {!error && events.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No activity history found for this visitor.</p>
            </div>
          )}

          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={event._id || event.id || index}
                className="flex items-start gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {/* Action Icon */}
                <div className="p-2 rounded-full bg-card shadow-sm">
                  {getActionIcon(event.actionType)}
                </div>

                {/* Activity Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      {/* Action Description */}
                      <p className="font-medium text-foreground">
                        {event.details || event.message || event.description || "Activity performed"}
                      </p>

                      {/* Employee Information */}
                      {event.employeeName && (
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            by <span className="font-medium">{event.employeeName}</span>
                            {event.employeeCode && (
                              <span className="text-muted-foreground ml-1">({event.employeeCode})</span>
                            )}
                            {/* Place Information */}
                            {event.placeName && (
                              <span className="text-blue-600 dark:text-blue-400 ml-2">
                                at <span className="font-medium">{event.placeName}</span>
                                {event.placeCode && (
                                  <span className="text-blue-500 dark:text-blue-300 ml-1">({event.placeCode})</span>
                                )}
                              </span>
                            )}
                          </span>
                          {event.employeeType && (
                            <Badge variant="outline" className="text-xs">
                              {event.employeeType === 'permanent' ? 'Permanent' : 
                               event.employeeType === 'volunteer' ? 'Volunteer' : 
                               event.employeeType}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Type Badge */}
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getActionColor(event.actionType)}`}>
                          {event.action || event.type || 'Activity'}
                        </Badge>
                        {event.module && (
                          <Badge variant="outline" className="text-xs">
                            {event.module}
                          </Badge>
                        )}
                      </div>

                      {/* Additional Info */}
                      {event.ipAddress && (
                        <p className="text-xs text-muted-foreground">
                          IP: {event.ipAddress}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(event.createdAt || event.timestamp || event.time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link to={`/visitors/view/${id}`}>
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Visitor
          </Button>
        </Link>
        <Link to="/visitors">
          <Button>
            Back to Visitors
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default VisitorHistory;
