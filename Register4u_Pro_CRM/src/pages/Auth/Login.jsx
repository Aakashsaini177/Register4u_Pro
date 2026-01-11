import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { authAPI } from "@/lib/api";
import { portalAuthAPI } from "@/lib/portalApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { 
  LockClosedIcon, 
  UserIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  TruckIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginSection, setLoginSection] = useState('admin'); // 'admin' or 'other'
  const [loginType, setLoginType] = useState('admin'); // 'admin', 'employee', 'driver', 'hotel', 'travel'
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const portalLogin = usePortalAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleSectionChange = (section) => {
    setLoginSection(section);
    if (section === 'admin') {
      setLoginType('admin');
    } else {
      setLoginType('driver');
    }
    reset();
  };

  const handleTypeChange = (type) => {
    setLoginType(type);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (loginSection === 'admin') {
        // Admin/Employee Login
        if (loginType === 'admin') {
          // Admin Login
          const response = await authAPI.login({
            username: data.username,
            password: data.password,
          });

          if (response.data.success) {
            const userData = response.data.data;

            if (userData.user.type !== "admin" && userData.user.role !== "admin") {
              toast.error("Only Administrators can login here.");
              return;
            }

            login(userData, response.data.data.token, "admin");
            toast.success(`Welcome Administrator!`);
            navigate("/dashboard");
          } else {
            toast.error(response.data.message || "Login failed");
          }
        } else {
          // Employee Login
          const response = await portalAuthAPI.login({
            loginId: data.loginId,
            password: data.password,
          });

          if (response.data.success) {
            const userData = response.data.data;
            const role = userData.role;

            if (role === "employee" || role === "permanent_employee" || role === "volunteer") {
              login(userData, response.data.token, "employee");

              if (userData.user?.firstLogin) {
                navigate("/employee/change-password");
              } else {
                navigate("/employee/dashboard");
              }
              toast.success(`Welcome ${userData.user?.name || "Employee"}!`);
            } else {
              toast.error("Invalid employee credentials");
            }
          } else {
            toast.error(response.data.message || "Login failed");
          }
        }
      } else {
        // Other Login (Driver, Hotel, Travel)
        const response = await portalAuthAPI.login({
          loginId: data.loginId,
          password: data.password,
        });

        if (response.data.success) {
          const userData = response.data.data;
          const role = userData.role;

          if (role === loginType) {
            portalLogin(userData, response.data.token);
            const roleRedirectMap = {
              hotel: "/portal/hotel",
              driver: "/portal/driver",
              travel: "/portal/travel",
            };
            const redirect = roleRedirectMap[role] || "/portal";
            navigate(redirect, { replace: true });
            toast.success("Login successful!");
          } else {
            toast.error(`Invalid ${loginType} credentials`);
          }
        } else {
          toast.error(response.data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const getLoginTitle = () => {
    if (loginSection === 'admin') {
      return loginType === 'admin' ? 'Admin Login' : 'Employee Login';
    } else {
      return `${loginType.charAt(0).toUpperCase() + loginType.slice(1)} Login`;
    }
  };

  const getLoginDescription = () => {
    if (loginSection === 'admin') {
      return loginType === 'admin' 
        ? 'Enter your admin credentials to access the system'
        : 'Enter your employee credentials to access your dashboard';
    } else {
      return `Enter your ${loginType} credentials to access your portal`;
    }
  };

  const getFieldLabel = () => {
    return loginType === 'admin' ? 'Username' : 'Login ID';
  };

  const getFieldPlaceholder = () => {
    if (loginType === 'admin') return 'Enter admin username';
    if (loginType === 'employee') return 'Enter employee ID';
    return `Enter your ${loginType} ID`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-50 dark:from-gray-900 dark:via-background dark:to-gray-900 px-4">
      <div className="max-w-md w-full">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
            Register4u Pro
          </h1>
          <p className="text-muted-foreground">Event Management System</p>
        </div>

        {/* Section Toggle */}
        <div className="bg-card rounded-2xl shadow-xl border border-border mb-6">
          <div className="flex rounded-t-2xl overflow-hidden">
            <button
              onClick={() => handleSectionChange('admin')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                loginSection === 'admin'
                  ? 'bg-primary-600 text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Admin & Employee
              </div>
            </button>
            <button
              onClick={() => handleSectionChange('other')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                loginSection === 'other'
                  ? 'bg-primary-600 text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserGroupIcon className="h-5 w-5" />
                Other Login
              </div>
            </button>
          </div>

          {/* Login Type Buttons */}
          <div className="p-6 border-t border-border">
            {loginSection === 'admin' ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleTypeChange('admin')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    loginType === 'admin'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheckIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Admin</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTypeChange('employee')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    loginType === 'employee'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Employee</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => handleTypeChange('driver')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    loginType === 'driver'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <TruckIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Driver</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTypeChange('hotel')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    loginType === 'hotel'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <BuildingOfficeIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Hotel</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTypeChange('travel')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    loginType === 'travel'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <MapPinIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Travel</span>
                  </div>
                </button>
              </div>
            )}

            {/* Login Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{getLoginTitle()}</h2>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                {getLoginDescription()}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Username/Login ID */}
                <div>
                  <Label htmlFor={loginType === 'admin' ? 'username' : 'loginId'} required>
                    {getFieldLabel()}
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id={loginType === 'admin' ? 'username' : 'loginId'}
                      type="text"
                      placeholder={getFieldPlaceholder()}
                      className="pl-10"
                      error={errors.username || errors.loginId}
                      {...register(loginType === 'admin' ? 'username' : 'loginId', {
                        required: `${getFieldLabel()} is required`,
                      })}
                    />
                  </div>
                  {(errors.username || errors.loginId) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username?.message || errors.loginId?.message}
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
                      <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
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

              {loginSection === 'other' && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Default password for new accounts is same as Login ID.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © 2025 Register4u Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
