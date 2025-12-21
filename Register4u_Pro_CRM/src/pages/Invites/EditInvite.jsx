import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { inviteAPI, categoryAPI } from "@/lib/api";
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
import { Save, X } from "lucide-react";
import toast from "react-hot-toast";

const EditInvite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    maxUses: 1,
    uses: 0,
    validUntil: "",
    category: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [catRes, inviteRes] = await Promise.all([
        categoryAPI.getAll(),
        inviteAPI.getById(id),
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }

      if (inviteRes.data.success) {
        const invite = inviteRes.data.data;
        setFormData({
          name: invite.name || "",
          contact: invite.contact || "",
          maxUses: invite.maxUses || 1,
          uses: invite.usedCount || 0,
          validUntil: invite.validUntil
            ? new Date(invite.validUntil).toISOString().split("T")[0]
            : "",
          category:
            invite.prefillData?.category?.id ||
            invite.prefillData?.category?._id ||
            invite.prefillData?.category ||
            "",
        });
      }
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load invite details");
      navigate("/invites");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        contact: formData.contact,
        maxUses: formData.maxUses,
        validUntil: formData.validUntil,
        category: formData.category,
        type: parseInt(formData.maxUses) > 1 ? "MULTI" : "SINGLE",
      };

      const response = await inviteAPI.update(id, payload);
      if (response.data.success) {
        toast.success("Invite updated successfully");
        navigate("/invites");
      } else {
        toast.error(response.data.message || "Failed to update invite");
      }
    } catch (error) {
      console.error("Error updating invite:", error);
      toast.error("Error updating invite");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <h1 className="text-2xl font-bold text-gray-800">Invites</h1>
        <span>Edit invite.</span>
        <Link to="/invites" className="text-blue-600 hover:underline">
          « Back to all invites
        </Link>
      </div>

      <Card className="max-w-4xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">Name(FOR)</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

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
                disabled={submitting}
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

export default EditInvite;
