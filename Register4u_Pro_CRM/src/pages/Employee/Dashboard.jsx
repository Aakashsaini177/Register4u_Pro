import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { dashboardAPI, visitorAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import {
  UserGroupIcon,
  QrCodeIcon,
  PrinterIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { employee, role, isPermanentEmployee, isVolunteer } = useAuthStore();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todayScans: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await visitorAPI.getDashboardStats();
      if (response.data.success) {
        const { totalVisitors, todayScans, recentActivities } =
          response.data.data;
        setStats({
          totalVisitors,
          todayScans,
          recentActivities,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getRoleDisplayName = () => {
    if (isPermanentEmployee()) return "Permanent Employee";
    if (isVolunteer()) return "Volunteer";
    return "Employee";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {employee?.name || "Employee"}!
            </h1>
            <p className="text-primary-100 mt-1">
              {getRoleDisplayName()} • Ready to help visitors today
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">Today's Date</p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Visitors - Available to all employees */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isPermanentEmployee() ? "Total Visitors" : "Visitors Today"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isPermanentEmployee()
                    ? stats.totalVisitors
                    : Math.floor(stats.totalVisitors / 10)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Scans */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  My Scans Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.todayScans}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <QrCodeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Activity Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Last Activity
                </p>
                <div className="mt-1">
                  {stats.recentActivities.length > 0 ? (
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.recentActivities[0].time}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stats.recentActivities[0].date ===
                        new Date().toLocaleDateString()
                          ? "Today"
                          : stats.recentActivities[0].date}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-gray-400">--:--</p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate("/scanner")}
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <QrCodeIcon className="h-6 w-6" />
              <span className="text-sm">Scanner</span>
            </Button>

            <Button
              onClick={() => navigate("/print-kiosk")}
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <PrinterIcon className="h-6 w-6" />
              <span className="text-sm">Print Kiosk</span>
            </Button>

            {isPermanentEmployee() && (
              <Button
                onClick={() => navigate("/visitors")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <UserGroupIcon className="h-6 w-6" />
                <span className="text-sm">Visitors</span>
              </Button>
            )}

            <Button
              onClick={() => navigate("/employee/profile")}
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <UserIcon className="h-6 w-6" />
              <span className="text-sm">My Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "scan"
                      ? "bg-green-100"
                      : activity.type === "print"
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  }`}
                >
                  {activity.type === "scan" && (
                    <QrCodeIcon className="h-4 w-4 text-green-600" />
                  )}
                  {activity.type === "print" && (
                    <PrinterIcon className="h-4 w-4 text-blue-600" />
                  )}
                  {activity.type === "register" && (
                    <UserIcon className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {isVolunteer() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <UserIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">
                  Volunteer Access
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You have volunteer-level access. You can scan visitors and
                  help with basic registration, but cannot delete visitor
                  records or access administrative features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDashboard;
