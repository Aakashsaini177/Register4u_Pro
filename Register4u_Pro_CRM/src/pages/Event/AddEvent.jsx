import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { eventAPI, companyAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Loading } from "@/components/ui/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const AddEvent = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // useFormPersistence("add_event_form", watch, setValue); // Removed - don't persist data in add form

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
    // Clear any existing form persistence data for add event
    localStorage.removeItem("add_event_form");
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await companyAPI.getAll();
      if (response.data.success) {
        setCompanies(response.data.data || []);
      } else {
        toast.error("Failed to load companies");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await eventAPI.create(data);
      if (response.data.success) {
        toast.success("Event added successfully!");
        // Clear form after successful submission
        setValue("orgName", "");
        setValue("eventName", "");
        setValue("StartTime", "");
        setValue("EndTime", "");
        setValue("expectedVisitor", "");
        setValue("eventDescription", "");
        setValue("eventHeadName", "");
        setValue("eventHeadEmail", "");
        setValue("eventHeadMob", "");
        setValue("venue", "");
        setValue("city", "");
        setValue("state", "");
        setValue("pincode", "");
        setValue("address", "");
        setValue("locationUrl", "");
        navigate("/event");
      } else {
        toast.error("Failed to add event");
      }
    } catch (error) {
      toast.error("Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/event">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Event</h1>
          <p className="text-gray-600 mt-1">Create a new event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Basic Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="orgName">Company/Organisation Name</Label>
                  <Select
                    onValueChange={(value) => setValue("orgName", value)}
                    defaultValue=""
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select a company/organisation"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCompanies ? (
                        <SelectItem value="" disabled>
                          Loading companies...
                        </SelectItem>
                      ) : companies.length === 0 ? (
                        <SelectItem value="" disabled>
                          No companies found
                        </SelectItem>
                      ) : (
                        companies.map((company) => (
                          <SelectItem key={company.id || company._id} value={company.name || company.companyName}>
                            {company.name || company.companyName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select from existing companies or{" "}
                    <Link to="/company/add" className="text-blue-600 hover:underline">
                      add a new company
                    </Link>
                  </p>
                </div>

                <div>
                  <Label htmlFor="eventName" required>
                    Event Name
                  </Label>
                  <Input
                    id="eventName"
                    type="text"
                    placeholder="Enter event name"
                    className="mt-1"
                    {...register("eventName", {
                      required: "Event name is required",
                    })}
                  />
                  {errors.eventName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="StartTime" required>
                    Start Date
                  </Label>
                  <Input
                    id="StartTime"
                    type="date"
                    className="mt-1"
                    {...register("StartTime", {
                      required: "Start date is required",
                    })}
                  />
                  {errors.StartTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.StartTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="EndTime">End Date</Label>
                  <Input
                    id="EndTime"
                    type="date"
                    className="mt-1"
                    {...register("EndTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="expectedVisitor">Expected Visitors</Label>
                  <Input
                    id="expectedVisitor"
                    type="number"
                    placeholder="Enter expected visitor count"
                    className="mt-1"
                    {...register("expectedVisitor")}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="eventDescription">Event Description</Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Enter event description"
                    className="mt-1"
                    rows="3"
                    {...register("eventDescription")}
                  />
                </div>
              </div>
            </div>

            {/* Event Head Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Head Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="eventHeadName">Event Head Name</Label>
                  <Input
                    id="eventHeadName"
                    type="text"
                    placeholder="Enter event head name"
                    className="mt-1"
                    {...register("eventHeadName")}
                  />
                </div>

                <div>
                  <Label htmlFor="eventHeadEmail">Event Head Email</Label>
                  <Input
                    id="eventHeadEmail"
                    type="email"
                    placeholder="Enter event head email"
                    className="mt-1"
                    {...register("eventHeadEmail", {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email format",
                      },
                    })}
                  />
                  {errors.eventHeadEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventHeadEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventHeadMob">Event Head Mobile</Label>
                  <Input
                    id="eventHeadMob"
                    type="tel"
                    placeholder="10-digit mobile number"
                    className="mt-1"
                    maxLength="10"
                    {...register("eventHeadMob", {
                      pattern: {
                        value: /^[6-9][0-9]{9}$/,
                        message: "Valid 10-digit mobile number required",
                      },
                    })}
                    onInput={(e) =>
                      (e.target.value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10))
                    }
                  />
                  {errors.eventHeadMob && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventHeadMob.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue & Location Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Venue & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    type="text"
                    placeholder="Enter venue name"
                    className="mt-1"
                    {...register("venue")}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter city"
                    className="mt-1"
                    {...register("city")}
                  />
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
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="6-digit pincode"
                    className="mt-1"
                    maxLength="6"
                    {...register("pincode", {
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

                <div className="md:col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete address"
                    className="mt-1"
                    rows="2"
                    {...register("address")}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="locationUrl">
                    Location URL (Google Maps Link)
                  </Label>
                  <Input
                    id="locationUrl"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="mt-1"
                    {...register("locationUrl", {
                      pattern: {
                        value: /^(https?|http):\/\/[^\s/$.?#].[^\s]*$/,
                        message: "Please enter a valid URL",
                      },
                    })}
                  />
                  {errors.locationUrl && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.locationUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t dark:border-gray-700">
              <Link to="/event">
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
                  "Save Event"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddEvent;
