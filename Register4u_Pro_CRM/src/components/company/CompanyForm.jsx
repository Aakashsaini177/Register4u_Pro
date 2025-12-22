import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Loading } from "@/components/ui/Loading";

const CompanyForm = ({ onSubmit, loading, initialValues = {}, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="company_name" required>
            Company Name
          </Label>
          <Input
            id="company_name"
            type="text"
            placeholder="Enter name"
            className="mt-1"
            error={errors.name}
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="company_email" required>
            Email
          </Label>
          <Input
            id="company_email"
            type="email"
            placeholder="Enter email"
            className="mt-1"
            error={errors.email}
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="company_contact">Phone Number</Label>
          <Input
            id="company_contact"
            type="tel"
            placeholder="Enter phone"
            className="mt-1"
            {...register("contact")}
          />
        </div>

        <div>
          <Label htmlFor="company_website">Website</Label>
          <Input
            id="company_website"
            type="url"
            placeholder="Enter website"
            className="mt-1"
            {...register("website")}
          />
        </div>

        <div>
          <Label htmlFor="company_city">City</Label>
          <Input
            id="company_city"
            type="text"
            placeholder="Enter city"
            className="mt-1"
            {...register("city")}
          />
        </div>

        <div>
          <Label htmlFor="company_state">State</Label>
          <Input
            id="company_state"
            type="text"
            placeholder="Enter state"
            className="mt-1"
            {...register("state")}
          />
        </div>

        <div>
          <Label htmlFor="company_pincode">Pincode</Label>
          <Input
            id="company_pincode"
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
          <Label htmlFor="company_type">Company Type</Label>
          <select
            id="company_type"
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register("company_type")}
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
        <Label htmlFor="company_address">Address</Label>
        <Textarea
          id="company_address"
          placeholder="Enter address"
          className="mt-1"
          {...register("address")}
        />
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loading
                size="sm"
                className="border-white border-t-transparent mr-2"
              />
              Saving...
            </>
          ) : (
            "Save Company"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
