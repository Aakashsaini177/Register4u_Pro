import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { visitorAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import {
  UserGroupIcon,
  QrCodeIcon,
  PrinterIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { employee, isPermanentEmployee, isVolunteer, updateEmployee } = useAuthStore();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todayScans: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      const { authAPI } = await import("@/lib/api");
      const response = await authAPI.getProfile();
      if (response.data.success) {
        updateEmployee(response.data.data.employee);
      }
    } catch (error) {
      console.error("Failed to fetch employee profile:", error);
      // Don't show error toast as this is background fetch
    }
  };

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
      {/* Enhanced Welcome Header with Profile Details */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Picture Placeholder */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            
            {/* Employee Details */}
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {employee?.name || "Employee"}!
              </h1>
              <p className="text-primary-100 mt-1">
                {getRoleDisplayName()} • Ready to help visitors today
              </p>
              
              {/* Additional Employee Info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-primary-100">
                {employee?.emp_code && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {employee.emp_code}
                  </span>
                )}
                {employee?.department && (
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="h-3 w-3" />
                    {employee.department}
                  </span>
                )}
                {employee?.contact && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {employee.contact}
                  </span>
                )}
              </div>
            </div>
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
            
            {/* Status Badge */}
            <div className="mt-2">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online
              </div>
            </div>
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
                <p className="text-sm font-medium text-muted-foreground">
                  {isPermanentEmployee() ? "Total Visitors" : "Visitors Today"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isPermanentEmployee()
                    ? stats.totalVisitors
                    : Math.floor(stats.totalVisitors / 10)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Scans */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  My Scans Today
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.todayScans}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <QrCodeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Activity Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Activity
                </p>
                <div className="mt-1">
                  {stats.recentActivities.length > 0 ? (
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {stats.recentActivities[0].time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.recentActivities[0].date ===
                        new Date().toLocaleDateString()
                          ? "Today"
                          : stats.recentActivities[0].date}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-muted-foreground">--:--</p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "scan"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : activity.type === "print"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-purple-100 dark:bg-purple-900/30"
                  }`}
                >
                  {activity.type === "scan" && (
                    <QrCodeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  {activity.type === "print" && (
                    <PrinterIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  {activity.type === "register" && (
                    <UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {isVolunteer() && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <UserIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Volunteer Access
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
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
