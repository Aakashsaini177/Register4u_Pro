import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loading, PageLoading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import toast from "react-hot-toast";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  QrCodeIcon,
  BriefcaseIcon,
  TruckIcon,
  EnvelopeIcon,
  TicketIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const SimpleEnhancedDashboard = () => {
  const [loading, withMinimumLoading] = useMinimumLoading(800);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData(false); // Silent refresh
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    const fetchFunction = async () => {
      try {
        const dashboardRes = await dashboardAPI.getDashboard();
        console.log("Real-time Dashboard Response:", dashboardRes.data);

        if (dashboardRes.data.success) {
          setDashboardData(dashboardRes.data.data);
          setLastUpdated(new Date(dashboardRes.data.data.lastUpdated));
        } else {
          toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
        if (showLoading) {
          toast.error("Failed to load dashboard data");
        }
      }
    };

    if (showLoading) {
      await withMinimumLoading(fetchFunction);
    } else {
      await fetchFunction();
    }
  }, [withMinimumLoading]);

  if (loading) {
    return <PageLoading />;
  }

  const stats = [
    {
      name: "Total Visitors",
      value: dashboardData?.visitorsCount || 0,
      change: `+${dashboardData?.todayVisitorCount || 0} today`,
      trend: "up",
      icon: UserGroupIcon,
      color: "bg-blue-500",
      link: "/visitors",
    },
    {
      name: "Companies",
      value: dashboardData?.orgCount || 0,
      change: "Active",
      trend: "up",
      icon: BuildingOfficeIcon,
      color: "bg-green-500",
      link: "/company",
    },
    {
      name: "This Week",
      value: dashboardData?.weekVisitorCount || 0,
      change: "Visitors",
      trend: "up",
      icon: ArrowTrendingUpIcon,
      color: "bg-purple-500",
      link: "/visitors",
    },
    {
      name: "Total Exhibitors",
      value: dashboardData?.exhibitorCount || 0,
      change: "Registered",
      trend: "up",
      icon: UserGroupIcon,
      color: "bg-indigo-500",
      link: "/visitors",
    },
    {
      name: "Total Rooms",
      value: dashboardData?.totalRoomsCount || 0,
      change: "Capacity",
      trend: "neutral",
      icon: HomeIcon,
      color: "bg-teal-500",
      link: "/hotel",
    },
    {
      name: "Occupied Rooms",
      value: dashboardData?.occupiedRoomsCount || 0,
      change: `${dashboardData?.occupancyPercentage || 0}% occupied`,
      trend: "up",
      icon: CheckCircleIcon,
      color: "bg-pink-500",
      link: "/hotel/reports",
    },
    {
      name: "Available Rooms",
      value: dashboardData?.availableRoomsCount || 0,
      change: "Ready",
      trend: "neutral",
      icon: HomeIcon,
      color: "bg-emerald-500",
      link: "/hotel",
    },
    {
      name: "Active Events",
      value: dashboardData?.ongoingEvents || 0,
      change: `${dashboardData?.upcomingEvents || 0} upcoming`,
      trend: "up",
      icon: CalendarIcon,
      color: "bg-orange-500",
      link: "/event",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header with real-time indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Real-time Dashboard
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Live Analytics & Room Management
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button
            onClick={() => fetchDashboardData(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ClockIcon className="h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.link}>
              <Card className="hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-white/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-t-4 border-transparent hover:border-blue-500 dark:border-gray-800 bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} p-4 rounded-xl shadow-lg dark:shadow-black/50 transition-transform duration-300 hover:scale-110`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Real-time Room Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
        <Card className="lg:col-span-2 hover:shadow-md dark:hover:shadow-white/5 transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Real-time Room Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <CheckCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{dashboardData?.occupiedRoomsCount || 0}</p>
                <p className="text-sm text-red-600">Occupied</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <HomeIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{dashboardData?.availableRoomsCount || 0}</p>
                <p className="text-sm text-green-600">Available</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{dashboardData?.maintenanceRoomsCount || 0}</p>
                <p className="text-sm text-orange-600">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md dark:hover:shadow-white/5 transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Hotel Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.hotelOccupancy?.slice(0, 5).map((hotel, index) => (
                <div key={hotel._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{hotel.hotelName}</p>
                    <p className="text-xs text-gray-500">{hotel.occupiedRooms}/{hotel.totalRooms} rooms</p>
                  </div>
                  <Badge variant={hotel.occupancyRate > 80 ? "destructive" : hotel.occupancyRate > 50 ? "default" : "secondary"}>
                    {Math.round(hotel.occupancyRate)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="hover:shadow-md dark:hover:shadow-white/5 transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData?.recentActivities?.slice(0, 8).map((activity, index) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400">by {activity.user}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card className="animate-fade-in-up delay-500 hover:shadow-md dark:hover:shadow-white/5 transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/visitors/add">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Add Visitor
              </Button>
            </Link>
            <Link to="/employee/add">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <UsersIcon className="h-5 w-5 mr-2" />
                Add Employee
              </Button>
            </Link>
            <Link to="/event/add">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Create Event
              </Button>
            </Link>
            <Link to="/scanner">
              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Scan Visitor
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleEnhancedDashboard;