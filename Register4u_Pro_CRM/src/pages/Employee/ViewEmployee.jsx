import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { employeeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "@/lib/utils";

const ViewEmployee = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [managerName, setManagerName] = useState("Loading...");

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id);
      if (response.data.success) {
        setEmployee(response.data.data);

        // Fetch manager name if ID exists
        if (response.data.data.reporting_manager) {
          if (response.data.data.reporting_manager === "Admin") {
            setManagerName("Admin");
          } else {
            fetchManagerName(response.data.data.reporting_manager);
          }
        } else {
          setManagerName("N/A");
        }
      } else {
        toast.error("Employee not found");
        navigate("/employee");
      }
    } catch (error) {
      toast.error("Failed to fetch employee details");
      navigate("/employee");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerName = async (managerId) => {
    try {
      // Ideally backend populates this, but if not we can fetch or just show ID
      const response = await employeeAPI.getById(managerId);
      if (response.data.success) {
        setManagerName(response.data.data.fullName);
      } else {
        setManagerName("Unknown");
      }
    } catch (error) {
      setManagerName("Unknown");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await employeeAPI.delete(id);
      if (response.data.success) {
        toast.success("Employee deleted successfully");
        navigate("/employee");
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  // Helper to format enum values nicely
  const formatEmpType = (type) => {
    if (!type) return "";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
      {/* Page header - Compact */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/employee">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Employee Details
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/employee/edit/${id}`}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-8"
            >
              <PencilIcon className="h-3 w-3" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1 h-8"
          >
            <TrashIcon className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-1.5">
            {/* Section: Employee Type */}
            <div className="lg:col-span-4 border-b pb-1 mb-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type & Manager
              </h3>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Employee Type</Label>
              <div className="mt-0.5 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border rounded text-xs font-medium h-7 flex items-center">
                {formatEmpType(employee.emp_type)}
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Reporting Manager</Label>
              <div className="mt-0.5 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border rounded text-xs font-medium h-7 flex items-center">
                {managerName}
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-2"></div>

            {/* Section: Basic Info */}
            <div className="lg:col-span-4 border-b pb-1 mt-1 mb-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Basic Information
              </h3>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Full Name</Label>
              <Input
                value={employee.fullName || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Email</Label>
              <Input
                value={employee.email || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Password</Label>
              <Input
                value="********"
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Mobile Number</Label>
              <Input
                value={employee.contact || employee.phone || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Date of Birth</Label>
              <Input
                value={employee.dob ? employee.dob.split("T")[0] : ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Gender</Label>
              <Input
                value={employee.gender || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50 capitalize"
              />
            </div>

            {/* Document Details (Conditional) */}
            {employee.emp_type === "employee" && (
              <>
                <div className="lg:col-span-4 border-b pb-1 mt-1 mb-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Documents
                  </h3>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">PAN Card</Label>
                  <Input
                    value={employee.pan_card || "N/A"}
                    readOnly
                    className="mt-0.5 h-7 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Aadhar Card</Label>
                  <Input
                    value={employee.adhar_card || "N/A"}
                    readOnly
                    className="mt-0.5 h-7 text-xs bg-gray-50"
                  />
                </div>
                <div className="hidden lg:block lg:col-span-2"></div>
              </>
            )}

            {/* Section: Location */}
            <div className="lg:col-span-4 border-b pb-1 mt-1 mb-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Location
              </h3>
            </div>

            <div>
              <Label className="text-xs text-gray-500">City</Label>
              <Input
                value={employee.city || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">State</Label>
              <Input
                value={employee.state || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Pincode</Label>
              <Input
                value={employee.pincode || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Location/Address</Label>
              <Input
                value={employee.location || employee.address || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            {/* Section: Employment */}
            <div className="lg:col-span-4 border-b pb-1 mt-1 mb-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Employment
              </h3>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Department</Label>
              <Input
                value={employee.department || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Designation</Label>
              <Input
                value={employee.designation || ""}
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Joining Date</Label>
              <Input
                value={
                  employee.joining_date
                    ? employee.joining_date.split("T")[0]
                    : ""
                }
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">End Date</Label>
              <Input
                value={
                  employee.ending_date
                    ? employee.ending_date.split("T")[0]
                    : "N/A"
                }
                readOnly
                className="mt-0.5 h-7 text-xs bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <div className="mt-0.5">
                <Badge
                  variant={
                    employee.status === "active" ? "success" : "secondary"
                  }
                  className="px-2 py-0.5 text-[10px]"
                >
                  {employee.status || "Active"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewEmployee;
