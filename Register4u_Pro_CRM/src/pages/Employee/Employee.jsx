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
import { highlightText } from "@/lib/highlightUtils";
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
  const [allEmployees, setAllEmployees] = useState([]); // Store all employees for client-side filtering
  const [loading, withMinimumLoading] = useMinimumLoading(600);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPasswords, setShowPasswords] = useState({}); // Track which passwords are visible

  // Real-time search effect
  useEffect(() => {
    if (searchTerm.trim()) {
      // Filter from all employees for real-time search
      const filtered = allEmployees.filter(employee => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (employee.emp_code && employee.emp_code.toLowerCase().includes(searchLower)) ||
          (employee.fullName && employee.fullName.toLowerCase().includes(searchLower)) ||
          (employee.email && employee.email.toLowerCase().includes(searchLower)) ||
          (employee.contact && employee.contact.toLowerCase().includes(searchLower)) ||
          (employee.phone && employee.phone.toLowerCase().includes(searchLower)) ||
          (employee.emp_type && employee.emp_type.toLowerCase().includes(searchLower)) ||
          (employee.department && employee.department.toLowerCase().includes(searchLower)) ||
          (employee.designation && employee.designation.toLowerCase().includes(searchLower)) ||
          (employee.location && employee.location.toLowerCase().includes(searchLower)) ||
          (employee.city && employee.city.toLowerCase().includes(searchLower))
        );
      });
      
      // Show all filtered results with scroll instead of pagination
      setEmployees(filtered);
      setTotalPages(1); // No pagination needed with scroll
    } else {
      // Show all employees when no search term
      setEmployees(allEmployees);
      setTotalPages(1); // No pagination needed with scroll
    }
  }, [searchTerm, allEmployees]);

  // Initial data fetch
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Reset to page 1 when search changes - not needed with scroll
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchTerm]);

  const fetchEmployees = async () => {
    await withMinimumLoading(async () => {
      const response = await employeeAPI.getAll({});

      console.log("Employee Response:", response.data);

      if (response.data.success) {
        const employeeData = response.data.data || [];
        setAllEmployees(employeeData);
        
        // Show all employees with scroll instead of pagination
        setEmployees(employeeData);
        setTotalPages(1);
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
            {searchTerm && (
              <span className="ml-2 text-sm">
                • Showing {employees.length + (currentPage - 1) * 10} of {
                  searchTerm.trim() 
                    ? allEmployees.filter(emp => {
                        const searchLower = searchTerm.toLowerCase();
                        return (
                          (emp.emp_code && emp.emp_code.toLowerCase().includes(searchLower)) ||
                          (emp.fullName && emp.fullName.toLowerCase().includes(searchLower)) ||
                          (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
                          (emp.contact && emp.contact.toLowerCase().includes(searchLower)) ||
                          (emp.phone && emp.phone.toLowerCase().includes(searchLower)) ||
                          (emp.emp_type && emp.emp_type.toLowerCase().includes(searchLower)) ||
                          (emp.department && emp.department.toLowerCase().includes(searchLower)) ||
                          (emp.designation && emp.designation.toLowerCase().includes(searchLower)) ||
                          (emp.location && emp.location.toLowerCase().includes(searchLower)) ||
                          (emp.city && emp.city.toLowerCase().includes(searchLower))
                        );
                      }).length
                    : allEmployees.length
                } results for "{searchTerm}"
              </span>
            )}
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
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <TableRow>
                    <TableHead className="text-center">Code</TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Phone</TableHead>
                    <TableHead className="text-center">Password</TableHead>
                    <TableHead className="text-center">Work Location</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Created Date
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium text-center">
                        {highlightText(
                          employee.emp_code || `#${employee.id.substring(0, 6)}...`,
                          searchTerm
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div>
                          <p className="font-medium whitespace-nowrap">
                            {highlightText(
                              employee.fullName || employee.name || "N/A",
                              searchTerm
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {highlightText(
                              employee.emp_type || employee.designation || "",
                              searchTerm
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {highlightText(employee.email || "N/A", searchTerm)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {highlightText(
                          employee.contact || employee.phone || "N/A",
                          searchTerm
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
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
                      <TableCell className="max-w-[250px] text-center">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-gray-100">
                            {highlightText(
                              employee.workLocation || employee.desk || employee.counter || employee.location || "N/A",
                              searchTerm
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
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
                      <TableCell className="whitespace-nowrap text-center">
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

          {/* Pagination - Removed since we're using scroll */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employee;
