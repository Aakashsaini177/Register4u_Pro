import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loading, PageLoading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import toast from "react-hot-toast";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [loading, withMinimumLoading] = useMinimumLoading(800); // 800ms minimum
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    await withMinimumLoading(async () => {
      const response = await dashboardAPI.getDashboard();
      console.log("Dashboard Response:", response.data);
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    }).catch((error) => {
      console.error("Dashboard Error:", error);
      toast.error("Failed to load dashboard data");
    });
  };

  if (loading) {
    return <PageLoading />;
  }

  const stats = [
    {
      name: "Total Employees",
      value: dashboardData?.employeeCount || 0,
      change: "+12%",
      trend: "up",
      icon: UsersIcon,
      color: "bg-blue-500",
      link: "/employee",
    },
    {
      name: "Volunteers",
      value: dashboardData?.volunteerCount || 0,
      change: "+8%",
      trend: "up",
      icon: UsersIcon,
      color: "bg-teal-500",
      link: "/employee",
    },
    {
      name: "Organizations",
      value: dashboardData?.orgCount || 0,
      change: "+8%",
      trend: "up",
      icon: BuildingOfficeIcon,
      color: "bg-green-500",
      link: "/organization",
    },
    {
      name: "Active Events",
      value: dashboardData?.eventCount || 0,
      change: "+23%",
      trend: "up",
      icon: CalendarIcon,
      color: "bg-purple-500",
      link: "/event",
    },
    {
      name: "Ongoing Events",
      value: dashboardData?.ongoingEvents || 0,
      change: "Live",
      trend: "up",
      icon: CalendarIcon,
      color: "bg-red-500",
      link: "/event",
    },
    {
      name: "Upcoming Events",
      value: dashboardData?.upcomingEvents || 0,
      change: "Soon",
      trend: "up",
      icon: CalendarIcon,
      color: "bg-indigo-500",
      link: "/event",
    },
    {
      name: "Total Visitors",
      value: dashboardData?.visitorsCount || 0,
      change: "-5%",
      trend: "down",
      icon: UserGroupIcon,
      color: "bg-orange-500",
      link: "/visitors",
    },
    {
      name: "Occupied Rooms",
      value: dashboardData?.occupiedRoomsCount || 0,
      change: "Active",
      trend: "up",
      icon: BuildingOfficeIcon,
      color: "bg-pink-500",
      link: "/hotels/view", // Assuming this route exists or /hotel/view
    },
  ];

  // Chart data
  // Real data for charts
  const totalStats =
    dashboardData?.employeeCount +
      dashboardData?.orgCount +
      dashboardData?.eventCount +
      dashboardData?.visitorCount || 1;

  const doughnutData = {
    labels: ["Employees", "Organizations", "Events", "Visitors"],
    datasets: [
      {
        data: [
          dashboardData?.employeeCount || 0,
          dashboardData?.orgCount || 0,
          dashboardData?.eventCount || 0,
          dashboardData?.visitorCount || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.9)", // Blue
          "rgba(16, 185, 129, 0.9)", // Green
          "rgba(168, 85, 247, 0.9)", // Purple
          "rgba(249, 115, 22, 0.9)", // Orange
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: "easeOutQuart",
    },
    hover: {
      mode: "nearest",
      intersect: true,
      animationDuration: 400,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9ca3af", // gray-400 for both light and dark
          padding: 20,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to Register4u Pro management system
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        {stats.map((stat) => {
          const Icon = stat.icon;
          // Get basic border color from stat color class (approximate mapping)
          // Skip border for Occupied Rooms as requested
          const borderClass =
            stat.name === "Occupied Rooms"
              ? ""
              : `border-t-4 border-transparent ${stat.color.replace(
                  "bg-",
                  "hover:border-"
                )}`;

          return (
            <Link key={stat.name} to={stat.link}>
              <Card
                className={`hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-white/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${borderClass} dark:border-gray-800 bg-white dark:bg-gray-900`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Total Count
                      </p>
                    </div>
                    <div
                      className={`${stat.color} p-4 rounded-xl shadow-lg dark:shadow-black/50 transition-transform duration-300 hover:scale-110`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Data Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">
        <Card className="hover:shadow-md dark:hover:shadow-white/5 transition-all duration-300 transform hover:scale-[1.02] dark:bg-gray-900 dark:border-gray-800 cursor-default">
          <CardHeader>
            <CardTitle>Data Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 hover:shadow-md dark:hover:shadow-white/5 transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle>System Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-blue-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {dashboardData?.employeeCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Database Records
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-lg border border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-green-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organizations
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {dashboardData?.orgCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Active Organizations
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-purple-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Events
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {dashboardData?.eventCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    All Events
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-orange-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Visitors
                  </p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {dashboardData?.visitorCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Registered Visitors
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="animate-fade-in-up delay-300 hover:shadow-md dark:hover:shadow-white/5 transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-800">
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

export default Dashboard;
