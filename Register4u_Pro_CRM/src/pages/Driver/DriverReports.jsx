import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { driverAPI } from "@/lib/api";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const DriverReports = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Daily Report State
  const [dailyDate, setDailyDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dailyData, setDailyData] = useState({ report: [], summary: {} });

  // Work Report State
  const [workStartDate, setWorkStartDate] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      "yyyy-MM-dd"
    )
  );
  const [workEndDate, setWorkEndDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [workData, setWorkData] = useState([]);

  useEffect(() => {
    if (activeTab === "daily") {
      fetchDailyReport();
    } else {
      fetchWorkReport();
    }
  }, [activeTab, dailyDate, workStartDate, workEndDate]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const { data } = await driverAPI.getDailyReport(dailyDate);
      setDailyData(data?.data || data || { report: [], summary: {} });
    } catch (error) {
      toast.error("Error fetching daily report");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkReport = async () => {
    setLoading(true);
    try {
      const { data } = await driverAPI.getWorkReport(workStartDate, workEndDate);
      setWorkData(data?.data || data || []);
    } catch (error) {
      toast.error("Error fetching work report");
    } finally {
      setLoading(false);
    }
  };

  const exportDailyReport = () => {
    if (!dailyData.report.length) return toast.error("No data to export");
    const ws = XLSX.utils.json_to_sheet(
      dailyData.report.map((item) => ({
        "Driver Name": item.driverId?.driverName || "N/A",
        Vehicle: item.driverId?.vehicleNumber || "N/A",
        "Visitor Name": item.visitorName,
        "Visitor Number": item.visitorNumber,
        "Pickup Location": item.pickupLocation,
        "Drop Location": item.dropLocation,
        Time: item.pickupTime,
        Status: item.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
    XLSX.writeFile(wb, `Driver_Daily_Report_${dailyDate}.xlsx`);
  };

  const exportWorkReport = () => {
    if (!workData.length) return toast.error("No data to export");
    const ws = XLSX.utils.json_to_sheet(workData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work Report");
    XLSX.writeFile(
      wb,
      `Driver_Work_Report_${workStartDate}_to_${workEndDate}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Driver Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor driver schedules and performance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "daily"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("daily")}
        >
          Daily Schedule
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "work"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("work")}
        >
          Work Report (Trips)
        </button>
      </div>

      {/* Content */}
      {activeTab === "daily" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Date:
              </label>
              <Input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="w-48"
              />
            </div>
            <Button onClick={exportDailyReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Trips</p>
                  <h3 className="text-2xl font-bold">
                    {dailyData.summary?.totalTrips || 0}
                  </h3>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    {dailyData.summary?.completedTrips || 0}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Scheduled</p>
                  <h3 className="text-2xl font-bold text-yellow-600">
                    {dailyData.summary?.scheduledTrips || 0}
                  </h3>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <h3 className="text-2xl font-bold text-red-600">
                    {dailyData.summary?.cancelledTrips || 0}
                  </h3>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </CardContent>
            </Card>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Drop</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : dailyData.report.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No trips found for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  dailyData.report.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">
                          {item.driverId?.driverName || "Unassigned"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.driverId?.vehicleNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.visitorName}</div>
                        <div className="text-xs text-gray-500">
                          {item.visitorNumber}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.pickupLocation}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.dropLocation}
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.pickupDate), "dd MMM")} AT{" "}
                        {item.pickupTime}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "completed"
                              ? "success"
                              : item.status === "cancelled"
                              ? "destructive"
                              : item.status === "in_progress"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From:
              </label>
              <Input
                type="date"
                value={workStartDate}
                onChange={(e) => setWorkStartDate(e.target.value)}
                className="w-40"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To:
              </label>
              <Input
                type="date"
                value={workEndDate}
                onChange={(e) => setWorkEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={exportWorkReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Vehicle Info</TableHead>
                  <TableHead className="text-center">Total Trips</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Scheduled</TableHead>
                  <TableHead className="text-center">Cancelled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : workData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No records found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  workData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        {item.driverName}
                      </TableCell>
                      <TableCell>
                        {item.vehicleNumber}
                        <br />
                        <span className="text-xs text-gray-500">
                          {item.contactNumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-lg px-3">
                          {item.totalTrips}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-bold">
                        {item.completedTrips}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-bold">
                        {item.scheduledTrips}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-bold">
                        {item.cancelledTrips}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverReports;
