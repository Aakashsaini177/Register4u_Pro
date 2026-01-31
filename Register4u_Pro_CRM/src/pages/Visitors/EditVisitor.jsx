import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { visitorAPI, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Hotel, Car } from "lucide-react";
import toast from "react-hot-toast";
import VisitorForm from "@/components/visitors/VisitorForm";
import { PageLoading } from "@/components/ui/Loading";
import HotelAllotmentModal from "@/components/modals/HotelAllotmentModal";
import DriverAllotmentModal from "@/components/modals/DriverAllotmentModal";

const EditVisitor = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [visitorData, setVisitorData] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState({});

  // Hotel/Driver Allotment Modal States
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchVisitor();
  }, [id]);

  const fetchVisitor = async () => {
    try {
      const response = await visitorAPI.getById(id);
      if (response.data.success) {
        const data = response.data.data;

        // Flatten payment details
        if (data.paymentDetails) {
          data.receiptNo = data.paymentDetails.receiptNo;
          data.amount = data.paymentDetails.amount;
        }

        // Handle Documents from API response
        // API returns data.documents as { aadharFront: 'filename', ... }
        // We pass this to existingDocuments prop
        if (data.documents) {
          setExistingDocuments(data.documents);
        }

        // Important: Ensure category is just the ID if populated
        // The API getById might return populated or simple object.
        // Let's check the controller (step 393). It returns `Visitor.findOne`.
        // If the schema references 'Category', FindOne typically returns the ID unless populated.
        // But better safe: if it's an object, extract ID.
        if (data.category && typeof data.category === "object") {
          data.category = data.category._id || data.category.id;
        }

        setVisitorData(data);
      } else {
        toast.error("Visitor not found");
        navigate("/visitors");
      }
    } catch (error) {
      console.error("Error fetching visitor:", error);
      toast.error("Failed to fetch visitor details");
      navigate("/visitors");
    } finally {
      setPageLoading(false);
    }
  };

  const handleHotelAllot = () => {
    setShowHotelModal(true);
  };

  const handleDriverAllot = () => {
    setShowDriverModal(true);
  };

  const handleHotelModalClose = () => {
    setShowHotelModal(false);
  };

  const handleDriverModalClose = () => {
    setShowDriverModal(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Map form fields to API fields
      formData.append("name", data.name);
      formData.append("contact", data.contact);
      formData.append("email", data.email || "");
      formData.append("aadharNumber", data.aadharNumber || "");
      formData.append("category", data.category);
      formData.append("companyName", data.companyName || "");
      formData.append("city", data.city || "");
      formData.append("gender", data.gender || "");
      formData.append("ticket", data.ticket || "");
      formData.append("hostess", data.hostess || "");
      formData.append("professions", data.professions || "");
      formData.append("receiptNo", data.receiptNo || "");
      formData.append("amount", data.amount || "");

      // Handle photo
      // If data.photo is a File/Blob (new upload), append it.
      // If it's a string (URL), it means no change or selected from file manager.
      // Handle photo
      if (data.photo) {
        if (typeof data.photo === "string") {
          formData.append("photo", data.photo);
        } else if (data.photo instanceof File) {
          formData.append("photo", data.photo);
        } else if (data.photo.length > 0 && data.photo[0] instanceof File) {
          formData.append("photo", data.photo[0]);
        }
      }

      // Handle Documents (ImageInput returns FileList or null in form state usually)
      const appendFile = (key, fileData) => {
        if (fileData && fileData.length > 0 && fileData[0] instanceof File) {
          formData.append(key, fileData[0]);
        }
      };

      appendFile("aadharFront", data.aadharFront);
      appendFile("aadharBack", data.aadharBack);
      appendFile("panFront", data.panFront);

      const response = await visitorAPI.update(id, formData);

      if (response.data.success) {
        toast.success("Visitor updated successfully!");
        navigate("/visitors");
      } else {
        toast.error(response.data.message || "Failed to update visitor");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update visitor");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/visitors">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Visitor</h1>
            <p className="text-gray-600 mt-1">Update visitor information</p>
          </div>
        </div>

        {/* Hotel and Driver Allot Buttons - Only show in edit mode */}
        <div className="flex gap-3">
          <Button
            onClick={handleHotelAllot}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Hotel className="h-4 w-4" />
            Hotel Allot
          </Button>
          <Button
            onClick={handleDriverAllot}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Car className="h-4 w-4" />
            Driver Allot
          </Button>
        </div>
      </div>

      {visitorData && (
        <VisitorForm
          onSubmit={onSubmit}
          loading={loading}
          defaultValues={visitorData}
          existingDocuments={existingDocuments}
          isPublic={false}
          isEditMode={true}
        />
      )}

      {/* Hotel Allotment Modal */}
      <HotelAllotmentModal
        isOpen={showHotelModal}
        onClose={handleHotelModalClose}
        visitorData={visitorData}
      />

      {/* Driver Allotment Modal */}
      <DriverAllotmentModal
        isOpen={showDriverModal}
        onClose={handleDriverModalClose}
        visitorData={visitorData}
      />
    </div>
  );
};

export default EditVisitor;
