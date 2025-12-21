import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VisitorForm from "@/components/Visitors/VisitorForm";
import { inviteAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const PublicVisitorRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [inviteCode, setInviteCode] = useState(null);
  const [validating, setValidating] = useState(true);
  const navigate = useNavigate();

  const { code: routeCode } = useParams();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || routeCode; // Check query param first, then route param

    if (code) {
      validateInviteCode(code);
    } else {
      setValidating(false);
    }
  }, []);

  const [errorState, setErrorState] = useState(null);

  // ... (useEffect remains similar)

  const validateInviteCode = async (code) => {
    try {
      const response = await inviteAPI.validate(code);

      if (response.data.success) {
        const invite = response.data.data;
        setInviteCode(code);
        setInitialData({
          // Handle both populated objects and ID strings safely
          category:
            invite.prefillData?.category?._id || invite.prefillData?.category,
          companyName:
            invite.prefillData?.company?.company_name ||
            invite.prefillData?.company,
          professions: invite.prefillData?.purpose,
        });
        toast.success("Invite applied successfully!");
      }
    } catch (error) {
      console.error("Invite Error", error);
      // Nice error handling
      const msg =
        error.response?.data?.message || "Invalid or expired invite link.";
      setErrorState(msg);
      // Don't toast here if we are showing a full page error, or toast a gentle warning?
      // User asked for "ache experience". A full screen explanation is better than a fleeting toast.
    } finally {
      setValidating(false);
    }
  };

  if (errorState) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-l-4 border-red-500">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Link Issue</h2>
            <p className="text-gray-600">{errorState}</p>
            <p className="text-sm text-gray-500">
              The invite link you used might be expired, fully used, or
              incorrect.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Button
                onClick={() => {
                  setErrorState(null);
                  setInviteCode(null);
                }}
                className="w-full"
              >
                Continue as Regular Visitor
              </Button>
              <p className="text-xs text-gray-400">
                or ask your host for a new link
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRegistration = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Map form fields to API fields
      formData.append("name", data.name);
      formData.append("contact", data.contact);
      formData.append("email", data.email);
      formData.append("category", data.category);
      formData.append("companyName", data.companyName || "");
      formData.append("city", data.city || "");
      formData.append("gender", data.gender || "");
      formData.append("professions", data.professions || "");

      if (inviteCode) {
        formData.append("inviteCode", inviteCode);
      } else {
        // Fallback: Check URL/Params again just in case state was lost
        const fallbackCode =
          new URLSearchParams(window.location.search).get("code") || routeCode;
        if (fallbackCode) {
          formData.append("inviteCode", fallbackCode);
        }
      }

      // Handle photo
      // Public form typically uses device upload (ImageInput -> Array)
      if (data.photo) {
        if (typeof data.photo === "string") {
          formData.append("photo", data.photo);
        } else if (data.photo.length > 0) {
          formData.append("photo", data.photo[0]);
        }
      }

      // Call PUBLIC API endpoint
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:4002/api/v1";

      const response = await fetch(`${API_URL}/visitors/create-public`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Registration Successful!");
        // Navigate to Success Page with Visitor ID
        // Navigate to Success Page with Visitor ID and Invite Info
        navigate(`/register/success/${result.data.visitorId}`, {
          state: {
            inviteCode:
              inviteCode ||
              new URLSearchParams(window.location.search).get("code") ||
              routeCode,
            inviteType: initialData?.type || "SINGLE", // We might need this, or just rely on backend result?
            // Actually, best to just pass the code. The success page can blindly link back.
          },
        });
      } else {
        // Check if existing
        if (result.isExisting) {
          toast.success("Welcome back! You are already registered.");
          navigate(`/register/success/${result.data.visitorId}`);
        } else {
          toast.error(result.message || "Failed to register");
        }
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Validating Invite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">
            Register4u
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome! Please register to enter.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-center">Visitor Registration</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <VisitorForm
              onSubmit={handleRegistration}
              loading={loading}
              isPublic={true}
              defaultValues={initialData}
            />
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-400">
          Powered by Register4u Pro
        </div>
      </div>
    </div>
  );
};

export default PublicVisitorRegistration;
