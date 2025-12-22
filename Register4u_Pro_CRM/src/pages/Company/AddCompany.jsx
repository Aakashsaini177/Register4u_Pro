import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { companyAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import CompanyForm from "@/components/company/CompanyForm";

const AddCompany = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await companyAPI.create(data);
      if (response.data.success) {
        toast.success("Company added successfully!");
        navigate("/company");
      } else {
        toast.error(response.data.message || "Failed to add company");
      }
    } catch (error) {
      toast.error("Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/company">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Company</h1>
          <p className="text-gray-600 mt-1">Create a new company</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm
            onSubmit={onSubmit}
            loading={loading}
            onCancel={() => navigate("/company")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCompany;
