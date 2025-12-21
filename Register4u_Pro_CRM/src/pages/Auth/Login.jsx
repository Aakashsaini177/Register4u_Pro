import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Admin Login Only
      const response = await authAPI.login({
        username: data.username,
        password: data.password,
      });

      if (response.data.success) {
        const userData = response.data.data;

        // Ensure it is admin
        if (userData.user.type !== "admin" && userData.user.role !== "admin") {
          toast.error("Only Administrators can login here.");
          return;
        }

        // Store login data
        login(userData, response.data.data.token, "admin");

        toast.success(`Welcome Administrator!`);
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Invalid username or password");
      }
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
          <div className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-200">
            Admin Access Only
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h2>
          <p className="text-gray-600 mb-6 text-center">
            Enter your admin credentials to access the system
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <Label htmlFor="username" required>
                Username
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  className="pl-10"
                  error={errors.username}
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
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
                  placeholder="Enter admin password"
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

          {/* New Portal Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-2">Not an Admin?</p>
            <Link
              to="/portal/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-primary-200 text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 w-full"
            >
              Go to Employee & Partner Portal
            </Link>
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

export default Login;
