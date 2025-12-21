import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { categoryAPI, companyAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import QuickAddModal from "@/components/ui/QuickAddModal";
import toast from "react-hot-toast";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import ImageInput from "@/components/ui/ImageInput";

const VisitorForm = ({
  onSubmit,
  loading,
  isPublic = false,
  defaultValues = {},
  existingDocuments = {}, // { aadharFront: 'url', ... }
}) => {
  const [categories, setCategories] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // Quick Add Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    fetchCategories();
    fetchOrganizations();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      if (!isPublic) toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await companyAPI.getAll();
      if (response.data.success) {
        setOrganizations(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      if (!isPublic) toast.error("Failed to load companies");
    } finally {
      setLoadingOrgs(false);
    }
  };

  // Quick Add Handlers
  const handleAddCategory = async (name) => {
    const response = await categoryAPI.create({ name });
    if (response.data.success) {
      toast.success("Category added!");
      await fetchCategories();
    }
  };

  const handleAddOrganization = async (name) => {
    const response = await companyAPI.create({ name });
    if (response.data.success) {
      toast.success("Organization added!");
      await fetchOrganizations();
    }
  };

  const onFormSubmit = (data) => {
    // Pass data back to parent
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Card className={isPublic ? "shadow-none border-0" : ""}>
          {!isPublic && (
            <CardHeader>
              <CardTitle>Visitor Information</CardTitle>
            </CardHeader>
          )}
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" required>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    className="mt-1"
                    error={errors.name}
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contact" required>
                    Contact Number
                  </Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="Enter contact number"
                    className="mt-1"
                    error={errors.contact}
                    {...register("contact", {
                      required: "Contact is required",
                    })}
                  />
                  {errors.contact && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    className="mt-1"
                    {...register("email")}
                  />
                </div>
                <div>
                  <Label htmlFor="aadharNumber">Aadhar Card Number</Label>
                  <Input
                    id="aadharNumber"
                    type="text"
                    placeholder="Enter Aadhar number"
                    className="mt-1"
                    {...register("aadharNumber")}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register("gender")}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category & Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Category & Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="category" required>
                      Category
                    </Label>
                    {!isPublic && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategoryModal(true)}
                        className="h-6 px-2 text-primary hover:text-primary/80"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" /> Add New
                      </Button>
                    )}
                  </div>
                  {loadingCategories ? (
                    <div className="p-2 border rounded-md bg-gray-50 text-gray-400">
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register("category", {
                        required: "Category is required",
                      })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name || cat.category}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Company Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="companyName">Company Name</Label>
                    {!isPublic && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOrgModal(true)}
                        className="h-6 px-2 text-primary hover:text-primary/80"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" /> Add New
                      </Button>
                    )}
                  </div>
                  {loadingOrgs ? (
                    <div className="p-2 border rounded-md bg-gray-50 text-gray-400">
                      Loading companies...
                    </div>
                  ) : (
                    <select
                      id="companyName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register("companyName")}
                    >
                      <option value="">Select Company</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.name}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <Label htmlFor="professions">Profession</Label>
                  <Input
                    id="professions"
                    type="text"
                    placeholder="Enter profession"
                    className="mt-1"
                    {...register("professions")}
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
              </div>
            </div>

            {/* Event Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ticket">Ticket Number</Label>
                  <Input
                    id="ticket"
                    type="text"
                    placeholder="Enter ticket number"
                    className="mt-1"
                    {...register("ticket")}
                  />
                </div>
                <div>
                  <Label htmlFor="hostess">Hostess Name</Label>
                  <Input
                    id="hostess"
                    type="text"
                    placeholder="Enter hostess name"
                    className="mt-1"
                    {...register("hostess")}
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="receiptNo">Receipt No</Label>
                  <Input
                    id="receiptNo"
                    type="text"
                    placeholder="Enter receipt no"
                    className="mt-1"
                    {...register("receiptNo")}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    className="mt-1"
                    {...register("amount")}
                  />
                </div>
              </div>
            </div>

            {/* Photo Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Visitor Photo</h3>

              <div className="space-y-2">
                <ImageInput
                  label="Visitor Photo"
                  required={true}
                  defaultPreview={
                    typeof watch("photo") === "string" && watch("photo")
                      ? watch("photo").startsWith("http")
                        ? watch("photo")
                        : `http://localhost:4002/uploads/${watch("photo")}`
                      : null
                  }
                  error={errors.photo?.message}
                  onChange={(file) => {
                    if (file) {
                      setValue("photo", [file], { shouldValidate: true });
                    } else {
                      setValue("photo", null, { shouldValidate: true });
                    }
                  }}
                />
                {/* Hidden input for validation */}
                <input
                  type="hidden"
                  {...register("photo", {
                    required: "Visitor photo is required",
                    validate: (value) => {
                      if (!value) return "Visitor photo is required";
                      if (Array.isArray(value) && value.length === 0)
                        return "Visitor photo is required";
                      return true;
                    },
                  })}
                />
              </div>
            </div>

            {/* ID Proof Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                ID Proofs (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Aadhar Front */}
                <div>
                  <ImageInput
                    label="Aadhar Card (Front)"
                    required={false}
                    defaultPreview={
                      existingDocuments.aadharFront
                        ? `http://localhost:4002/uploads/${existingDocuments.aadharFront}`
                        : null
                    }
                    error={errors.aadharFront?.message}
                    aspectRatio={1.6} // ID Card aspect ratio
                    onChange={(file) => {
                      if (file)
                        setValue("aadharFront", [file], {
                          shouldValidate: true,
                        });
                      else
                        setValue("aadharFront", null, { shouldValidate: true });
                    }}
                  />
                </div>

                {/* Aadhar Back */}
                <div>
                  <ImageInput
                    label="Aadhar Card (Back)"
                    required={false}
                    defaultPreview={
                      existingDocuments.aadharBack
                        ? `http://localhost:4002/uploads/${existingDocuments.aadharBack}`
                        : null
                    }
                    error={errors.aadharBack?.message}
                    aspectRatio={1.6}
                    onChange={(file) => {
                      if (file)
                        setValue("aadharBack", [file], {
                          shouldValidate: true,
                        });
                      else
                        setValue("aadharBack", null, { shouldValidate: true });
                    }}
                  />
                </div>

                {/* PAN Front */}
                <div>
                  <ImageInput
                    label="PAN Card (Front)"
                    required={false}
                    defaultPreview={
                      existingDocuments.panFront
                        ? `http://localhost:4002/uploads/${existingDocuments.panFront}`
                        : null
                    }
                    error={errors.panFront?.message}
                    aspectRatio={1.6}
                    onChange={(file) => {
                      if (file)
                        setValue("panFront", [file], { shouldValidate: true });
                      else setValue("panFront", null, { shouldValidate: true });
                    }}
                  />
                </div>

                {/* PAN Back */}
                <div>
                  <ImageInput
                    label="PAN Card (Back)"
                    required={false}
                    defaultPreview={
                      existingDocuments.panBack
                        ? `http://localhost:4002/uploads/${existingDocuments.panBack}`
                        : null
                    }
                    error={errors.panBack?.message}
                    aspectRatio={1.6}
                    onChange={(file) => {
                      if (file)
                        setValue("panBack", [file], { shouldValidate: true });
                      else setValue("panBack", null, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              {!isPublic && (
                <Link to="/visitors">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              )}
              <Button
                type="submit"
                disabled={loading || loadingCategories || loadingOrgs}
                className={isPublic ? "w-full" : ""}
              >
                {loading ? (
                  <>
                    <Loading
                      size="sm"
                      className="border-white border-t-transparent"
                    />{" "}
                    {isPublic ? "Registering..." : "Saving..."}
                  </>
                ) : isPublic ? (
                  "Register"
                ) : (
                  "Save Visitor"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Quick Add Modals (Only for internal usage) */}
      {!isPublic && (
        <>
          <QuickAddModal
            isOpen={showCategoryModal}
            onClose={() => setShowCategoryModal(false)}
            title="Add New Category"
            label="Category Name"
            placeholder="e.g. VIP, Delegate"
            onSave={handleAddCategory}
          />

          <QuickAddModal
            isOpen={showOrgModal}
            onClose={() => setShowOrgModal(false)}
            title="Add New Company"
            label="Company Name"
            placeholder="e.g. Google, Microsoft"
            onSave={handleAddOrganization}
          />
        </>
      )}
    </div>
  );
};

export default VisitorForm;
