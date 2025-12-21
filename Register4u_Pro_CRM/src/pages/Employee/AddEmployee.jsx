import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { employeeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Loading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import useFormPersistence from "@/hooks/useFormPersistence";

const AddEmployee = () => {
  const [loading, setLoading] = useState(false);
  const [empType, setEmpType] = useState("");
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useFormPersistence("add_employee_form", watch, setValue);

  const selectedEmpType = watch("emp_type");

  // Fetch reporting managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await employeeAPI.getAll();
        if (response.data.success) {
          // Filter out volunteers, only show permanent employees as managers
          const permanentEmps = (response.data.data || []).filter(
            (e) => e.emp_type !== "volunteer"
          );
          setManagers(permanentEmps);
        }
      } catch (error) {
        console.error("Failed to fetch managers:", error);
      }
    };
    fetchManagers();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Map frontend fields to backend schema
      const payload = {
        ...data,
        joining_date: data.StartTime,
        ending_date: data.EndTime,
        reporting_manager: data.Reporting_Manager || undefined,
        // Ensure consistent casing if needed, but select values are already correct
      };

      // Remove mapped fields to avoid clutter (optional but good practice)
      delete payload.StartTime;
      delete payload.EndTime;
      delete payload.Reporting_Manager;

      const response = await employeeAPI.create(payload);

      if (response.data.success) {
        toast.success("Employee added successfully!");
        navigate("/employee");
      } else {
        toast.error(response.data.message || "Failed to add employee");
      }
    } catch (error) {
      toast.error("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link to="/employee">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Employee</h1>
          <p className="text-gray-600 mt-1">Create a new employee record</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Employee Type & Manager Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Employee Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emp_type" required>
                    Employee Type
                  </Label>
                  <select
                    id="emp_type"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register("emp_type", {
                      required: "Employee Type is required",
                    })}
                  >
                    <option value="">Select Employee Type</option>
                    <option value="permanent">Permanent</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                  {errors.emp_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emp_type.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="Reporting_Manager">Reporting Manager</Label>
                  <select
                    id="Reporting_Manager"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register("Reporting_Manager")}
                  >
                    <option value="">Select Reporting Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" required>
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter full name"
                    className="mt-1"
                    {...register("fullName", {
                      required: "Full Name is required",
                    })}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    className="mt-1"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder="Enter password"
                    className="mt-1"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact" required>
                    Mobile Number
                  </Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="10-digit mobile number"
                    className="mt-1"
                    maxLength="10"
                    {...register("contact", {
                      required: "Contact is required",
                      pattern: {
                        value: /^[6-9][0-9]{9}$/,
                        message: "Valid 10-digit mobile number required",
                      },
                    })}
                  />
                  {errors.contact && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contact.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dob" required>
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    className="mt-1"
                    {...register("dob", { required: "DOB is required" })}
                  />
                  {errors.dob && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dob.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register("gender")}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Document Details (Only for Permanent Employees) */}
            {selectedEmpType === "employee" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pan_card">PAN Card</Label>
                    <Input
                      id="pan_card"
                      type="text"
                      placeholder="ABCDE1234F"
                      className="mt-1 uppercase"
                      maxLength="10"
                      {...register("pan_card", {
                        pattern: {
                          value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                          message: "Invalid PAN format (e.g., ABCDE1234F)",
                        },
                      })}
                      onInput={(e) =>
                        (e.target.value = e.target.value.toUpperCase())
                      }
                    />
                    {errors.pan_card && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.pan_card.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="adhar_card">Aadhar Card</Label>
                    <Input
                      id="adhar_card"
                      type="text"
                      placeholder="12-digit Aadhar number"
                      className="mt-1"
                      maxLength="12"
                      {...register("adhar_card", {
                        pattern: {
                          value: /^[0-9]{12}$/,
                          message: "Aadhar must be 12 digits",
                        },
                      })}
                      onInput={(e) =>
                        (e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12))
                      }
                    />
                    {errors.adhar_card && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adhar_card.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" required>
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter city"
                    className="mt-1"
                    {...register("city", { required: "City is required" })}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Enter state"
                    className="mt-1"
                    {...register("state")}
                  />
                </div>

                <div>
                  <Label htmlFor="pincode" required>
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="6-digit pincode"
                    className="mt-1"
                    maxLength="6"
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Pincode must be 6 digits",
                      },
                    })}
                    onInput={(e) =>
                      (e.target.value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6))
                    }
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location/Address</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter work location"
                    className="mt-1"
                    {...register("location")}
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="StartTime" required>
                    Joining Date
                  </Label>
                  <Input
                    id="StartTime"
                    type="date"
                    className="mt-1"
                    {...register("StartTime", {
                      required: "Joining date is required",
                    })}
                  />
                  {errors.StartTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.StartTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="EndTime">End Date (if applicable)</Label>
                  <Input
                    id="EndTime"
                    type="date"
                    className="mt-1"
                    {...register("EndTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Link to="/employee">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loading
                      size="sm"
                      className="border-white border-t-transparent"
                    />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Employee"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddEmployee;
