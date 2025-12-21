import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const EmployeeProfile = () => {
  const { employee, updateEmployee } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setProfileData(response.data.data.employee);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setShowPasswordForm(false);
        reset();
        // Refresh profile to get updated info
        fetchProfile();
      }
    } catch (error) {
      console.error("Password change error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getRoleDisplayName = (type) => {
    switch (type) {
      case "permanent":
        return "Permanent Employee";
      case "volunteer":
        return "Volunteer";
      default:
        return "Employee";
    }
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  const profile = profileData || employee;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{profile?.name || "Not set"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Employee Type</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-primary-600" />
                      <p className="text-gray-900">{getRoleDisplayName(profile?.type)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">{profile?.email || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Number</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">{profile?.contact || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                Password Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <div className="text-center py-6">
                  <KeyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Change Your Password
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Keep your account secure by updating your password regularly
                  </p>
                  <Button onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" required>
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      error={errors.currentPassword}
                      {...register("currentPassword", {
                        required: "Current password is required",
                      })}
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword" required>
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      error={errors.newPassword}
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" required>
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      error={errors.confirmPassword}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === newPassword || "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loading size="sm" className="border-white border-t-transparent" />
                          <span>Changing...</span>
                        </div>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Information Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Account</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Login Enabled</span>
              </div>
            </CardContent>
          </Card>

          {/* Login Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClockIcon className="h-5 w-5" />
                Login Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Last Login
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(profile?.lastLogin)}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Password Changed
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(profile?.passwordChangedAt)}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Account Type
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {getRoleDisplayName(profile?.type)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Security Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Change your password regularly</li>
                <li>• Use a strong, unique password</li>
                <li>• Don't share your login credentials</li>
                <li>• Log out when finished</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;