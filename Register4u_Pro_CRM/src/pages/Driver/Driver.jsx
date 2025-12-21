import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Car,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/Dialog";

const Driver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch("http://localhost:4002/api/v1/drivers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data || []);
      } else {
        toast.error("Failed to fetch drivers");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Error fetching drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDriverToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/drivers/${driverToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Driver deleted successfully");
        fetchDrivers();
      } else {
        toast.error("Failed to delete driver");
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Error deleting driver");
    } finally {
      setDeleteConfirmOpen(false);
      setDriverToDelete(null);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contactNumber.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || driver.status === filterStatus;
    const matchesEmployee =
      filterEmployee === "all" ||
      (filterEmployee === "employee" && driver.isEmployee) ||
      (filterEmployee === "non-employee" && !driver.isEmployee);
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Drivers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage drivers and vehicle assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/driver/add")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Driver
          </Button>
          <Button onClick={() => navigate("/driver/reports")} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_duty">On Duty</option>
                <option value="off_duty">Off Duty</option>
              </select>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="employee">Employee</option>
                <option value="non-employee">Non-Employee</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{driver.driverName}</CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      driver.status === "active" ? "default" : "secondary"
                    }
                  >
                    {driver.status}
                  </Badge>
                  {driver.isEmployee && (
                    <Badge variant="outline">Employee</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {driver.vehicleNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {driver.contactNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {driver.seater} Seater - {driver.vehicleType}
                  </span>
                </div>
              </div>

              {driver.remarks && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Remarks:</strong> {driver.remarks}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/driver/view/${driver.id}`)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/driver/edit/${driver.id}`)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(driver.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No drivers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== "all" || filterEmployee !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first driver."}
            </p>
            {!searchTerm &&
              filterStatus === "all" &&
              filterEmployee === "all" && (
                <Button onClick={() => navigate("/driver/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogHeader onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Delete Driver</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this driver? This action cannot be
            undone and will remove all associated data.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Delete Driver
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Driver;
