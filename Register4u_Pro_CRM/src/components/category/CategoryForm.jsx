import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { PlusIcon } from "@heroicons/react/24/outline";

const CategoryForm = ({ onSubmit, loading, initialValues = {}, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="category_name" required>
          Category Name
        </Label>
        <Input
          id="category_name"
          type="text"
          placeholder="Enter name"
          className="mt-1"
          error={errors.name}
          {...register("name", { required: "Category name is required" })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="category_description">Description</Label>
        <Input
          id="category_description"
          type="text"
          placeholder="Enter description"
          className="mt-1"
          {...register("description")}
        />
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? (
            <>
              <Loading
                size="sm"
                className="border-white border-t-transparent mr-2"
              />
              Adding...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Category
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
