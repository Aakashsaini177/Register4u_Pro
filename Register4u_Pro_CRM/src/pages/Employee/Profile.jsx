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
  IdentificationIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
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
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      {/* Enhanced Header with Profile Picture */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Profile Picture Placeholder */}
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile?.name || "Employee"}</h1>
              <p className="text-primary-100 text-lg mt-1">
                {getRoleDisplayName(profile?.type)}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-primary-100">
                {profile?.emp_code && (
                  <span className="flex items-center gap-1">
                    <IdentificationIcon className="h-4 w-4" />
                    {profile.emp_code}
                  </span>
                )}
                {profile?.department && (
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    {profile.department}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                profile?.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  profile?.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {profile?.status === 'active' ? 'Active' : 'Inactive'}
              </div>
              <p className="text-primary-100 text-sm mt-2">
                Member since {formatDate(profile?.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <p className="text-foreground">{profile?.name || "Not set"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee Type</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-primary-600" />
                      <p className="text-foreground">{getRoleDisplayName(profile?.type)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{profile?.email || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{profile?.contact || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee Code</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IdentificationIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground font-mono">{profile?.emp_code || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Login Code ID</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IdentificationIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground font-mono">{profile?.code_id || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{profile?.department || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Designation</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{profile?.designation || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Work Location</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{profile?.location || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employment Status</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <p className="text-foreground capitalize">{profile?.status || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(profile?.joining_date || profile?.ending_date) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.joining_date && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Joining Date</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground">{formatDate(profile.joining_date)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {profile?.ending_date && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground">{formatDate(profile.ending_date)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          {(profile?.dob || profile?.gender || profile?.city || profile?.state || profile?.pincode || profile?.address) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(profile?.dob || profile?.gender) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.dob && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="text-foreground">{formatDate(profile.dob)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {profile?.gender && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <p className="text-foreground capitalize">{profile.gender}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(profile?.city || profile?.state || profile?.pincode) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {profile?.city && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">City</Label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="text-foreground">{profile.city}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {profile?.state && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">State</Label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="text-foreground">{profile.state}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {profile?.pincode && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Pincode</Label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <p className="text-foreground">{profile.pincode}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {profile?.address && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-foreground">{profile.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Document Information */}
          {(profile?.pan_card || profile?.adhar_card) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.pan_card && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">PAN Card</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground font-mono">{profile.pan_card}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {profile?.adhar_card && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Aadhaar Card</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground font-mono">
                            {profile.adhar_card.replace(/(\d{4})(?=\d)/g, '$1 ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                  <KeyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Change Your Password
                  </h3>
                  <p className="text-muted-foreground mb-4">
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
                <div className={`w-3 h-3 rounded-full ${profile?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {profile?.status === 'active' ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${profile?.login_enabled ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {profile?.login_enabled ? 'Login Enabled' : 'Login Disabled'}
                </span>
              </div>
              {profile?.firstLogin && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">First Time Login</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Account Created
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(profile?.createdAt)}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(profile?.updatedAt)}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Employee ID
                </Label>
                <p className="text-sm text-gray-900 mt-1 font-mono">
                  {profile?.id || "Not available"}
                </p>
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
                  {formatDateTime(profile?.lastLogin)}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase">
                  Password Changed
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDateTime(profile?.passwordChangedAt)}
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
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  First Login
                </Label>
                <p className="text-sm text-foreground mt-1">
                  {profile?.firstLogin ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Login Enabled
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${profile?.login_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-sm text-foreground">
                    {profile?.login_enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Security Tips</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Change your password regularly</li>
                <li>• Use a strong, unique password</li>
                <li>• Don't share your login credentials</li>
                <li>• Log out when finished</li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
                className="w-full justify-start"
                disabled={showPasswordForm}
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full justify-start"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                Refresh Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;