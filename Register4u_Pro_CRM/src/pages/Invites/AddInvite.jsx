import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inviteAPI, categoryAPI, companyAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Save, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import CompanyForm from "@/components/company/CompanyForm";

const AddInvite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Form State matching the image fields
  const [formData, setFormData] = useState({
    name: "", // Name(FOR)
    contact: "", // Contact
    maxUses: 1, // Max Times Can be used
    uses: 0, // Uses (Read only usually for new)
    validUntil: "", // Valid till
    category: "", // Category
    company: "", // Company ID
  });

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load companies", error);
    }
  };

  const handleCreateCompany = async (data) => {
    setCompanyLoading(true);
    try {
      const response = await companyAPI.create(data);
      if (response.data.success) {
        toast.success("Company added successfully!");
        setShowCompanyModal(false);
        // Refresh companies list
        fetchCompanies();
        // Select the new company
        setFormData({
          ...formData,
          name: data.name,
          company: response.data.data._id || response.data.data.id, // Store ID
        });
      } else {
        toast.error(response.data.message || "Failed to add company");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company");
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construct payload
      const payload = {
        name: formData.name,
        contact: formData.contact,
        maxUses: formData.maxUses,
        // Uses is not sent for create usually, handled by backend
        validUntil: formData.validUntil,
        category: formData.category,
        company: formData.company, // Send Company ID
        // Defaulting Type logic from previous modal
        type: parseInt(formData.maxUses) > 1 ? "MULTI" : "SINGLE",
      };

      const response = await inviteAPI.create(payload);
      if (response.data.success) {
        toast.success("Invite created successfully");
        navigate("/invites");
      } else {
        toast.error(response.data.message || "Failed to create invite");
      }
    } catch (error) {
      console.error("Error creating invite:", error);
      toast.error("Error creating invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb style */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <h1 className="text-2xl font-bold text-gray-800">Invites</h1>
        <span>Add invite.</span>
        <Link to="/invites" className="text-blue-600 hover:underline">
          « Back to all invites
        </Link>
      </div>

      <Card className="max-w-4xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">Name(FOR)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    list="company-suggestions"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const matchedCompany = companies.find(
                        (c) => c.name.toLowerCase() === newName.toLowerCase()
                      );

                      const updates = { name: newName };
                      if (matchedCompany) {
                        updates.contact =
                          matchedCompany.contact || matchedCompany.phone || "";
                      }

                      setFormData((prev) => ({ ...prev, ...updates }));
                    }}
                    placeholder="Select company or type name"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <datalist id="company-suggestions">
                    {companies.map((company) => (
                      <option
                        key={company._id || company.id}
                        value={company.name}
                      />
                    ))}
                  </datalist>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowCompanyModal(true)}
                  className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Company
                </Button>
              </div>
            </div>

            {/* Add Company Modal */}
            <Dialog
              open={showCompanyModal}
              onOpenChange={setShowCompanyModal}
              isOpen={showCompanyModal}
              onClose={() => setShowCompanyModal(false)}
            >
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader onClose={() => setShowCompanyModal(false)}>
                  <DialogTitle>Add New Company</DialogTitle>
                </DialogHeader>
                <CompanyForm
                  onSubmit={handleCreateCompany}
                  loading={companyLoading}
                  onCancel={() => setShowCompanyModal(false)}
                />
              </DialogContent>
            </Dialog>

            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">Contact</Label>
              <Input
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="border-gray-200"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">
                Max Times Can be used
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
                className="border-gray-200"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">Uses</Label>
              <Input
                type="number"
                value={formData.uses}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">
                Valid till <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                className="border-gray-200"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger
                  className="border-gray-200"
                  displayValue={
                    categories.find(
                      (c) => (c._id || c.id) === formData.category
                    )?.name ||
                    categories.find(
                      (c) => (c._id || c.id) === formData.category
                    )?.category
                  }
                >
                  <SelectValue placeholder="Select an entry" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id || c.id} value={c._id || c.id}>
                      {c.name || c.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-6 flex gap-4">
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white min-w-[140px]"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save and back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none min-w-[100px]"
                onClick={() => navigate("/invites")}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddInvite;
