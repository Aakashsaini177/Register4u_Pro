import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI, hotelAPI, visitorAPI } from "@/lib/api";
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
  BriefcaseIcon,
  TruckIcon,
  EnvelopeIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [loading, withMinimumLoading] = useMinimumLoading(800); // 800ms minimum
  const [dashboardData, setDashboardData] = useState(null);
  const [totalRooms, setTotalRooms] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    await withMinimumLoading(async () => {
      try {
        // Fetch all visitors to calculate stats client-side since dashboard stats endpoint is failing
        const [dashboardRes, hotelRes, visitorsRes] = await Promise.all([
          dashboardAPI.getDashboard(),
          hotelAPI.getAll(),
          visitorAPI.getAll({}), // Fetch all visitors
        ]);

        console.log("Dashboard Response:", dashboardRes.data);
        const visitors = visitorsRes.data?.data || [];
        console.log("All Visitors:", visitors.length);

        // Calculate visitor stats
        const totalVisitors = visitors.length;
        const exhibitorsCount = visitors.filter(
          (v) => v.category?.toLowerCase() === "exhibitor"
        ).length;

        // Calculate today's visitors
        const today = new Date().toISOString().split("T")[0];
        const todayVisitorsCount = visitors.filter((v) => {
          if (!v.createdAt) return false;
          return v.createdAt.startsWith(today);
        }).length;

        if (dashboardRes.data.success) {
          setDashboardData({
            ...dashboardRes.data.data,
            // Use calculated values
            visitorsCount: totalVisitors,
            exhibitorCount: exhibitorsCount,
            todayVisitorCount: todayVisitorsCount,
          });
        } else {
          toast.error("Failed to load dashboard data");
        }

        if (hotelRes.data.success) {
          const hotels = hotelRes.data.data || [];
          const roomsCount = hotels.reduce((total, hotel) => {
            const hotelRooms =
              hotel.categories?.reduce((catTotal, cat) => {
                return catTotal + (parseInt(cat.numberOfRooms) || 0);
              }, 0) || 0;
            return total + hotelRooms;
          }, 0);
          setTotalRooms(roomsCount);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
        toast.error("Failed to load dashboard data");
      }
    });
  };

  if (loading) {
    return <PageLoading />;
  }

  const stats = [
    {
      name: "Total Visitors",
      value: dashboardData?.visitorsCount || 0,
      change: "All Time",
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
      name: "Visitors Today",
      value: dashboardData?.todayVisitorCount || 0,
      change: "Today",
      trend: "up",
      icon: UsersIcon,
      color: "bg-purple-500",
      link: "/visitors",
    },
    // {
    //   name: "Total Visitors by Date/Day",
    //   value: "View", // Placeholder as this is a chart/graph usually, or we link to report
    //   change: "Report",
    //   trend: "neutral",
    //   icon: CalendarIcon,
    //   color: "bg-orange-500",
    //   link: "/visitors", // Or specific report link
    // },
    {
      name: "Total Exhibitors",
      value: dashboardData?.exhibitorCount || 0,
      change: "Registered",
      trend: "up",
      icon: UserGroupIcon,
      color: "bg-indigo-500",
      link: "/visitors", // ideally filter by category
    },
    {
      name: "Total Rooms",
      value: totalRooms || 0,
      change: "Capacity",
      trend: "neutral",
      icon: BuildingOfficeIcon,
      color: "bg-teal-500",
      link: "/hotel",
    },
    {
      name: "Total Used Rooms",
      value: dashboardData?.occupiedRoomsCount || 0,
      change: "Occupied",
      trend: "up",
      icon: BuildingOfficeIcon,
      color: "bg-pink-500",
      link: "/hotel/reports",
    },
  ];

  // Chart data
  // Real data for charts
  const totalStats =
    dashboardData?.visitorsCount + dashboardData?.orgCount + totalRooms || 1;

  const doughnutData = {
    labels: ["Visitors", "Companies", "Exhibitors", "Rooms"],
    datasets: [
      {
        data: [
          dashboardData?.visitorsCount || 0,
          dashboardData?.orgCount || 0,
          dashboardData?.exhibitorCount || 0,
          totalRooms || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.9)", // Blue
          "rgba(16, 185, 129, 0.9)", // Green
          "rgba(99, 102, 241, 0.9)", // Indigo
          "rgba(20, 184, 166, 0.9)", // Teal
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
                <div className="p-4 bg-gradient-to-r from-teal-500/10 to-teal-600/10 dark:from-teal-500/20 dark:to-teal-600/20 rounded-lg border border-teal-200 dark:border-teal-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-teal-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Rooms
                  </p>
                  <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-2">
                    {totalRooms || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Room Capacity
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-lg border border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-green-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Companies
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {dashboardData?.orgCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Active Companies
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/20 dark:to-indigo-600/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-indigo-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Exhibitors
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    {dashboardData?.exhibitorCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Registered
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform duration-300 dark:hover:bg-orange-900/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Visitors
                  </p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {dashboardData?.visitorsCount || 0}
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
            <Link to="/company/add">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Add Company
              </Button>
            </Link>
            <Link to="/hotel/add">
              <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Add Hotel
              </Button>
            </Link>
            <Link to="/driver/add">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <TruckIcon className="h-5 w-5 mr-2" />
                Add Driver
              </Button>
            </Link>
            <Link to="/invites/add">
              <Button className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Send Invite
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
