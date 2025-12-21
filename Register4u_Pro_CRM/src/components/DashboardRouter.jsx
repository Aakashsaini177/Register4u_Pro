import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePortalAuthStore } from "../store/portalAuthStore";
import Dashboard from "../pages/Dashboard/Dashboard";

const DashboardRouter = () => {
  // 1. Check Main Auth (Admin & Employee)
  const {
    isAuthenticated: isMainAuth,
    role: mainRole,
    employee,
  } = useAuthStore();

  // 2. Check Portal Auth (Hotel, Driver, Travel)
  const { isAuthenticated: isPortalAuth, user: portalUser } =
    usePortalAuthStore();

  // Debug Log
  console.log("DashboardRouter Check:", {
    isMainAuth,
    mainRole,
    isPortalAuth,
    portalRole: portalUser?.role,
  });

  // PRIORITY 1: Main Auth (Admin vs Employee)
  if (isMainAuth) {
    // If Admin (role might be undefined or 'admin')
    if (!mainRole || mainRole === "admin") {
      return <Dashboard />; // Render Admin Dashboard directly
    }

    // If Employee
    if (
      mainRole === "employee" ||
      mainRole === "permanent_employee" ||
      isMainAuth
    ) {
      // Ideally we should check role explicitly, but legacy authStore might just have isAuthenticated=true for admin.
      // Let's assume if it is NOT Employee dashboard route, it's Admin.

      // WAIT: If I am an employee, I should go to /employee/dashboard
      // But how do we distinguish Admin vs Employee if role is not set?
      // Inspecting authStore: it has `employee` object if employee.
      if (employee) {
        return <Navigate to="/employee/dashboard" replace />;
      }
      return <Dashboard />; // Default to Admin
    }
  }

  // PRIORITY 2: Portal Auth
  if (isPortalAuth && portalUser?.role) {
    switch (portalUser.role) {
      case "hotel":
        return <Navigate to="/portal/hotel" replace />;
      case "driver":
        return <Navigate to="/portal/driver" replace />;
      case "travel":
        return <Navigate to="/portal/travel" replace />;
      default:
        return <Navigate to={`/portal/${portalUser.role}`} replace />;
    }
  }

  // Fallback: Login
  return <Navigate to="/login" replace />;
};

export default DashboardRouter;
