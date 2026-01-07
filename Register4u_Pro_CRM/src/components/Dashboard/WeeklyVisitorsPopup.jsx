import React, { useState, useEffect } from "react";
import { dashboardAPI, getImageUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const WeeklyVisitorsPopup = ({ isVisible, onClose }) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && !weeklyData) {
      fetchWeeklyVisitors();
    }
  }, [isVisible]);

  const fetchWeeklyVisitors = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getWeeklyVisitors();
      if (response.data.success) {
        setWeeklyData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching weekly visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                This Week's Visitors
              </h2>
              <p className="text-purple-100 mt-1">
                {weeklyData ? `${weeklyData.totalWeekVisitors} total visitors • ${weeklyData.todayVisitors} today` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="lg" />
            </div>
          ) : weeklyData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total This Week</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {weeklyData.totalWeekVisitors}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Today</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {weeklyData.todayVisitors}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Active Days</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {weeklyData.visitorsByDay.filter(day => day.visitors.length > 0).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Day-wise Breakdown */}
              <div className="space-y-4">
                {weeklyData.visitorsByDay.map((day) => (
                  <Card key={day.date} className={`${day.isToday ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/10' : ''} hover:shadow-md transition-shadow`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-500" />
                          <span className={`${day.isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {day.dayName}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                          </span>
                          {day.isToday && (
                            <Badge variant="success" className="ml-2">Today</Badge>
                          )}
                        </div>
                        <Badge variant={day.visitors.length > 0 ? "default" : "secondary"}>
                          {day.visitors.length} visitors
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    
                    {day.visitors.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="grid gap-3">
                          {day.visitors.map((visitor) => (
                            <div key={visitor.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                              {/* Visitor Photo */}
                              <div className="flex-shrink-0">
                                {visitor.photo ? (
                                  <img
                                    src={getImageUrl(visitor.photo)}
                                    alt={visitor.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold ${visitor.photo ? 'hidden' : 'flex'}`}>
                                  {visitor.name.charAt(0).toUpperCase()}
                                </div>
                              </div>

                              {/* Visitor Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {visitor.name}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {visitor.visitorId}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  {visitor.company !== 'N/A' && (
                                    <div className="flex items-center gap-1">
                                      <BuildingOfficeIcon className="h-3 w-3" />
                                      <span className="truncate">{visitor.company}</span>
                                    </div>
                                  )}
                                  
                                  {visitor.category !== 'N/A' && (
                                    <div className="flex items-center gap-1">
                                      <TagIcon className="h-3 w-3" />
                                      <span className="truncate">{visitor.category}</span>
                                    </div>
                                  )}
                                  
                                  {visitor.phone && (
                                    <div className="flex items-center gap-1">
                                      <PhoneIcon className="h-3 w-3" />
                                      <span className="truncate">{visitor.phone}</span>
                                    </div>
                                  )}
                                  
                                  {visitor.email && (
                                    <div className="flex items-center gap-1">
                                      <EnvelopeIcon className="h-3 w-3" />
                                      <span className="truncate">{visitor.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Registration Time */}
                              <div className="flex-shrink-0 text-right">
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{visitor.registrationTime}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                    
                    {day.visitors.length === 0 && (
                      <CardContent className="pt-0">
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          No visitors registered on this day
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Failed to load weekly visitors data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyVisitorsPopup;