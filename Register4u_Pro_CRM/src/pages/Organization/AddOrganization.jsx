import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { organizationAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Loading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const AddOrganization = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await organizationAPI.create(data);
      if (response.data.success) {
        toast.success("Organization added successfully!");
        navigate("/organization");
      } else {
        toast.error(response.data.message || "Failed to add organization");
      }
    } catch (error) {
      toast.error("Failed to add organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/organization">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Organization</h1>
          <p className="text-gray-600 mt-1">Create a new organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" required>
                  Organization Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter name"
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
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  className="mt-1"
                  error={errors.email}
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contact">Phone Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Enter phone"
                  className="mt-1"
                  {...register("contact")}
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="Enter website"
                  className="mt-1"
                  {...register("website")}
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
                  type="number"
                  placeholder="Enter pincode"
                  className="mt-1"
                  {...register("pincode")}
                />
              </div>

              <div>
                <Label htmlFor="GSIJN">GSTIN</Label>
                <Input
                  id="GSIJN"
                  type="text"
                  placeholder="Enter GSTIN"
                  className="mt-1"
                  {...register("GSIJN")}
                />
              </div>

              <div>
                <Label htmlFor="CIN">CIN</Label>
                <Input
                  id="CIN"
                  type="text"
                  placeholder="Enter CIN"
                  className="mt-1"
                  {...register("CIN")}
                />
              </div>

              <div>
                <Label htmlFor="org_type">Organization Type</Label>
                <select
                  id="org_type"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("org_type")}
                >
                  <option value="General">General</option>
                  <option value="Corporate">Corporate</option>
                  <option value="NGO">NGO</option>
                  <option value="Government">Government</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter address"
                className="mt-1"
                {...register("address")}
              />
            </div>
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Link to="/organization">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loading
                      size="sm"
                      className="border-white border-t-transparent"
                    />{" "}
                    Saving...
                  </>
                ) : (
                  "Save Organization"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddOrganization;
