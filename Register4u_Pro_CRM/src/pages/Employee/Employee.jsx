import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { employeeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { PageLoading, TableSkeleton } from "@/components/ui/Loading";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import toast from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, withMinimumLoading] = useMinimumLoading(600);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPasswords, setShowPasswords] = useState({}); // Track which passwords are visible

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm]);

  const fetchEmployees = async () => {
    await withMinimumLoading(async () => {
      const response = await employeeAPI.getAll({
        search: searchTerm,
      });

      console.log("Employee Response:", response.data);

      if (response.data.success) {
        const allEmployees = response.data.data || [];
        // Pagination on frontend
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedData = allEmployees.slice(startIndex, endIndex);

        setEmployees(paginatedData);
        setTotalPages(Math.ceil(allEmployees.length / 10) || 1);
        setInitialLoad(false);
      }
    }).catch((error) => {
      console.error("Employee Error:", error);
      toast.error("Failed to fetch employees");
      setInitialLoad(false);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await employeeAPI.delete(id);
      if (response.data.success) {
        toast.success("Employee deleted successfully");
        fetchEmployees();
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  };

  const togglePasswordVisibility = (employeeId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  // Show full page loader on initial load
  if (loading && initialLoad) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Employees
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your employees
          </p>
        </div>
        <Link to="/employee/add">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No employees found
              </p>
              <Link to="/employee/add">
                <Button className="mt-4">Add your first employee</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Work Location/Desk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Created Date
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.emp_code ||
                          `#${employee.id.substring(0, 6)}...`}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium whitespace-nowrap">
                            {employee.fullName || employee.name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {employee.emp_type || employee.designation || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{employee.email || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {employee.contact || employee.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {showPasswords[employee.id]
                              ? employee.currentPassword || "N/A"
                              : "••••••••"}
                          </span>
                          <button
                            onClick={() =>
                              togglePasswordVisibility(employee.id)
                            }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title={
                              showPasswords[employee.id]
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPasswords[employee.id] ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div
                          className="text-sm"
                          title={`${employee.location || employee.city || ""}${
                            employee.city && employee.state
                              ? `, ${employee.city}, ${employee.state}`
                              : ""
                          }`}
                        >
                          <p className="text-gray-900 dark:text-gray-100 truncate">
                            {employee.location || employee.city || "N/A"}
                          </p>
                          {employee.city && employee.state && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {employee.city}, {employee.state}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === "active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {employee.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(employee.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/employee/view/${employee.id}`}>
                            <Button variant="ghost" size="icon">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/employee/edit/${employee.id}`}>
                            <Button variant="ghost" size="icon">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employee;
