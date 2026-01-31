import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { employeeAPI, placeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Loading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import CreatePlaceModal from "@/pages/Place/CreatePlaceModal";

import useFormPersistence from "@/hooks/useFormPersistence";

const AddEmployee = () => {
  const [loading, setLoading] = useState(false);
  const [empType, setEmpType] = useState("");
  const [managers, setManagers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [showCreatePlaceModal, setShowCreatePlaceModal] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // useFormPersistence("add_employee_form", watch, setValue); // Disabled to ensure fresh form on every add

  const selectedEmpType = watch("emp_type");

  // Fetch reporting managers and places
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch managers
        const managersResponse = await employeeAPI.getAll();
        if (managersResponse.data.success) {
          // Filter to show only employees as potential managers (not volunteers, exhibitors, etc.)
          const employeeManagers = (managersResponse.data.data || []).filter(
            emp => emp.emp_type === "employee"
          );
          setManagers(employeeManagers);
        }

        // Fetch places
        await fetchPlaces();
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const fetchPlaces = async () => {
    try {
      const placesResponse = await placeAPI.getAll();
      if (placesResponse.data.success) {
        setPlaces(placesResponse.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch places:", error);
    }
  };

  const handlePlaceCreated = () => {
    setShowCreatePlaceModal(false);
    fetchPlaces(); // Refresh places list
    toast.success("Place created! You can now select it.");
  };

  // Update Reporting Manager based on Employee Type
  useEffect(() => {
    if (selectedEmpType === "employee") {
      // Default to "Admin" for employee type
      const currentManager = watch("Reporting_Manager");
      if (!currentManager) {
        setValue("Reporting_Manager", "Admin");
      }
    } else if (
      selectedEmpType === "volunteer" ||
      selectedEmpType === "hospitality_desk" ||
      selectedEmpType === "travel_desk" ||
      selectedEmpType === "cab_assistance_desk" ||
      selectedEmpType === "help_desk"
    ) {
      // Clear Admin if switching from employee to other types
      const currentManager = watch("Reporting_Manager");
      if (currentManager === "Admin") {
        setValue("Reporting_Manager", "");
      }
    }
  }, [selectedEmpType, setValue, watch]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log("📝 Creating employee with data:", data);
      console.log("📍 Place ID:", data.place_id);

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

      console.log("📤 Final payload:", payload);

      const response = await employeeAPI.create(payload);

      if (response.data.success) {
        console.log("✅ Employee created:", response.data);
        toast.success("Employee added successfully!");
        navigate("/employee");
      } else {
        toast.error(response.data.message || "Failed to add employee");
      }
    } catch (error) {
      console.error("Create employee error:", error);
      
      // Handle specific error types
      if (error.response?.data?.error === "DUPLICATE_EMAIL") {
        toast.error("This email is already registered. Please use a different email address.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add employee. Please try again.");
      }
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
                    <option value="employee">Employee</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="hospitality_desk">Hospitality Desk</option>
                    <option value="travel_desk">Travel Desk</option>
                    <option value="cab_assistance_desk">
                      Cab Assistance Desk
                    </option>
                    <option value="help_desk">Help Desk</option>
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
                    {/* Admin option only for Employee type */}
                    {selectedEmpType === "employee" && (
                      <option value="Admin">Admin</option>
                    )}
                    {/* Show only employees as managers (not volunteers, exhibitors, etc.) */}
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName} ({manager.emp_code || manager.id})
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
                  <Label htmlFor="department">
                    Department
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter department"
                    className="mt-1"
                    {...register("department")}
                  />
                </div>

                <div>
                  <Label htmlFor="designation">
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="Enter designation"
                    className="mt-1"
                    {...register("designation")}
                  />
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

            {/* Document Details (Only for Standard Employees) */}
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter work location"
                    className="mt-1"
                    {...register("location")}
                  />
                </div>

                <div>
                  <Label htmlFor="place_id">Assigned Place</Label>
                  <div className="flex gap-2 mt-1">
                    <select
                      id="place_id"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register("place_id")}
                    >
                      <option value="">Select Place</option>
                      {places.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreatePlaceModal(true)}
                      className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center gap-1"
                      title="Add New Place"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
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

      {/* Create Place Modal */}
      {showCreatePlaceModal && (
        <CreatePlaceModal
          onClose={() => setShowCreatePlaceModal(false)}
          onSuccess={handlePlaceCreated}
        />
      )}
    </div>
  );
};

export default AddEmployee;
