import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { portalAuthAPI } from "@/lib/portalApi";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";

const roleRedirectMap = {
  hotel: "/portal/hotel",
  driver: "/portal/driver",
  travel: "/portal/travel",
};

const PortalLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const portalLogin = usePortalAuthStore((state) => state.login);
  const employeeLogin = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await portalAuthAPI.login({
        loginId: data.loginId,
        password: data.password,
      });

      if (response.data.success) {
        const userData = response.data.data;
        const role = userData.role;

        // Check if it's an employee login
        if (
          role === "employee" ||
          role === "permanent_employee" ||
          role === "volunteer"
        ) {
          // Use main auth store for employees (to keep compatibility with existing employee pages)
          // The response structure might need adjustment if token is not at top level for portal login,
          // but we returned it at top level in controller.
          employeeLogin(userData, response.data.token, "employee");

          if (userData.user?.firstLogin) {
            navigate("/employee/change-password");
          } else {
            navigate("/employee/dashboard");
          }
          toast.success(`Welcome ${userData.user?.name || "Employee"}!`);
        } else {
          // Standard Portal Login (Hotel, Driver, Travel)
          portalLogin(userData, response.data.token);
          const redirect = roleRedirectMap[role] || "/portal";
          navigate(redirect, { replace: true });
          toast.success("Login successful!");
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid login ID or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
            Register4u Pro
          </h1>
          <p className="text-gray-600">Event Management System</p>
          <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
            Partner & Employee Access
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Portal Login
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Enter your ID (Hotel/Driver/Travel/Employee)
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Login ID */}
            <div>
              <Label htmlFor="loginId" required>
                Login ID
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter your Login ID"
                  className="pl-10"
                  error={errors.loginId}
                  {...register("loginId", {
                    required: "Login ID is required",
                  })}
                />
              </div>
              {errors.loginId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.loginId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  error={errors.password}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading
                    size="sm"
                    className="border-white border-t-transparent"
                  />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Default password for new accounts is same as Login ID.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          © 2025 Register4u Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PortalLogin;
