import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { companyAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading, PageLoading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CompanyForm from "@/components/company/CompanyForm";

const EditCompany = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await companyAPI.getById(id);
      if (response.data.success) {
        // Pre-fill form with existing data
        setInitialValues(response.data.data);
      } else {
        toast.error("Company not found");
        navigate("/company");
      }
    } catch (error) {
      console.error("Error fetching company:", error);
      toast.error("Failed to fetch company details");
      navigate("/company");
    } finally {
      setPageLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Check if we need FormData (for file upload)
      // Always use FormData to ensure backend Multer middleware handles it correctly
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        // Handle file
        if (key === "gst_certificate") {
          if (data.gst_certificate && data.gst_certificate[0]) {
            formData.append("gst_certificate", data.gst_certificate[0]);
          }
        }
        // Handle other fields (skip null/undefined)
        else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      const payload = formData;

      const response = await companyAPI.update(id, payload);
      if (response.data.success) {
        toast.success("Company updated successfully!");
        navigate("/company");
      } else {
        toast.error(response.data.message || "Failed to update company");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/company">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
          <p className="text-gray-600 mt-1">Update company information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            loading={loading}
            onCancel={() => navigate("/company")}
            existingGstCertificate={initialValues?.gst_certificate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCompany;
