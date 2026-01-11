import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { usePortalAuthStore } from "./store/portalAuthStore";
import ThemeProvider from "./components/ui/ThemeProvider";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import PortalLogin from "./pages/Portal/Login";
import PortalHotelDashboard from "./pages/Portal/HotelDashboard";
import PortalHotelVisitors from "./pages/Portal/PortalHotelVisitors";
import PortalHotelRooms from "./pages/Portal/PortalHotelRooms";
import PortalHotelScan from "./pages/Portal/PortalHotelScan";
import PortalDriverDashboard from "./pages/Portal/DriverDashboard";
import PortalTravelDashboard from "./pages/Portal/TravelDashboard";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import DashboardRouter from "./components/DashboardRouter";
import Employee from "./pages/Employee/Employee";
import AddEmployee from "./pages/Employee/AddEmployee";
import EditEmployee from "./pages/Employee/EditEmployee";
import ViewEmployee from "./pages/Employee/ViewEmployee";
import EmployeeDashboard from "./pages/Employee/Dashboard";
import EmployeeProfile from "./pages/Employee/Profile";
import ChangePassword from "./pages/Employee/ChangePassword";
import Company from "./pages/Company/Company";
import AddCompany from "./pages/Company/AddCompany";
import EditCompany from "./pages/Company/EditCompany";
import ViewCompany from "./pages/Company/ViewCompany";
import Event from "./pages/Event/Event";
import AddEvent from "./pages/Event/AddEvent";
import EditEvent from "./pages/Event/EditEvent";
import ViewEvent from "./pages/Event/ViewEvent";

import Visitors from "./pages/Visitors/Visitors";
import AddVisitor from "./pages/Visitors/AddVisitor";
import EditVisitor from "./pages/Visitors/EditVisitor";
import ViewVisitor from "./pages/Visitors/ViewVisitor";
import Card from "./pages/Visitors/Card";
import VisitorHistory from "./pages/Visitors/VisitorHistory";
import Scanner from "./pages/Scanner/Scanner";
import PrintScanner from "./pages/Scanner/PrintScanner";
import Category from "./pages/Category/Category";
import Settings from "./pages/Settings/Settings";
import Photos from "./pages/Photos/Photos";
import Profile from "./pages/Profile/Profile";
import CardDesigner from "./pages/Settings/CardDesigner";
import ActivityLogs from "./pages/ActivityLogs/ActivityLogs";

import Invites from "./pages/Invites/Invites";
import AddInvite from "./pages/Invites/AddInvite";
import EditInvite from "./pages/Invites/EditInvite";
import FileManager from "./pages/FileManager/FileManager";

// Import new module pages
import Hotel from "./pages/Hotel/Hotel";
import AddHotel from "./pages/Hotel/AddHotel";
import EditHotel from "./pages/Hotel/EditHotel";
import ViewHotel from "./pages/Hotel/ViewHotel";
import SelectEventForReport from "./pages/Hotel/SelectEventForReport";
import RoomAllotment from "./pages/Hotel/RoomAllotment";
import Requirements from "./pages/Hotel/Requirements";
import EditRoomAllotment from "./pages/Hotel/EditRoomAllotment";
import AllotHotel from "./pages/Hotel/AllotHotel";
import Travel from "./pages/Travel/Travel";
import AddTravel from "./pages/Travel/AddTravel";
import EditTravel from "./pages/Travel/EditTravel";
import ViewTravel from "./pages/Travel/ViewTravel";
import Driver from "./pages/Driver/Driver";
import AddDriver from "./pages/Driver/AddDriver";
import EditDriver from "./pages/Driver/EditDriver";
import DriverReports from "./pages/Driver/DriverReports";
import ViewDriver from "./pages/Driver/ViewDriver";

// Report Imports
import ReportLayout from "./pages/Event/Reports/ReportLayout";
import RoomCategorySummary from "./pages/Event/Reports/RoomCategorySummary";
import PaxSummary from "./pages/Event/Reports/PaxSummary";
import HotelSummary from "./pages/Event/Reports/HotelSummary";
import DateSummary from "./pages/Event/Reports/DateSummary";
import ContactSummary from "./pages/Event/Reports/ContactSummary";

import PublicVisitorRegistration from "./pages/Public/PublicVisitorRegistration";
import PublicVisitorSuccess from "./pages/Public/PublicVisitorSuccess";

// Place Management
import PlaceManagement from "./pages/Place/PlaceManagement";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated && window.location.pathname.startsWith("/login")) {
    // Only redirect to dashboard if trying to access login page
    // If accessing public registration pages, we might want to allow it even if logged in?
    // Actually, let's keep it simple. If logged in, maybe we shouldn't block public registration if checking it out.
    // But typically PublicRoute is for auth pages.
    // We can create a separate wrapper or just put Route without wrapper.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PortalProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = usePortalAuthStore((state) => state.isAuthenticated);
  const user = usePortalAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/portal/${user.role}`} replace />;
  }

  return children;
};

const PortalPublicRoute = ({ children }) => {
  const isAuthenticated = usePortalAuthStore((state) => state.isAuthenticated);
  const user = usePortalAuthStore((state) => state.user);

  if (isAuthenticated && user?.role) {
    return <Navigate to={`/portal/${user.role}`} replace />;
  }

  return children;
};

const PortalHome = () => {
  const user = usePortalAuthStore((state) => state.user);
  if (!user?.role) {
    return <Navigate to="/portal/login" replace />;
  }
  return <Navigate to={`/portal/${user.role}`} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public Visitor Registration Routes (No Auth Required) */}
        <Route path="/register" element={<PublicVisitorRegistration />} />
        <Route
          path="/register/success/:visitorId"
          element={<PublicVisitorSuccess />}
        />
        {/* Short invite link support */}
        <Route path="/invite/:code" element={<PublicVisitorRegistration />} />
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/portal/login"
          element={
            <PortalPublicRoute>
              <PortalLogin />
            </PortalPublicRoute>
          }
        />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <Employee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/add"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/edit/:id"
          element={
            <ProtectedRoute>
              <EditEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/view/:id"
          element={
            <ProtectedRoute>
              <ViewEmployee />
            </ProtectedRoute>
          }
        />
        {/* Company Routes */}
        <Route
          path="/company"
          element={
            <ProtectedRoute>
              <Company />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/add"
          element={
            <ProtectedRoute>
              <AddCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/edit/:id"
          element={
            <ProtectedRoute>
              <EditCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/view/:id"
          element={
            <ProtectedRoute>
              <ViewCompany />
            </ProtectedRoute>
          }
        />
        
        {/* Place Management Routes */}
        <Route
          path="/places"
          element={
            <ProtectedRoute>
              <PlaceManagement />
            </ProtectedRoute>
          }
        />
        
        {/* Event Routes */}
        <Route
          path="/event"
          element={
            <ProtectedRoute>
              <Event />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/add"
          element={
            <ProtectedRoute>
              <AddEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/edit/:id"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/view/:id"
          element={
            <ProtectedRoute>
              <ViewEvent />
            </ProtectedRoute>
          }
        />

        {/* Visitors Routes */}
        <Route
          path="/visitors"
          element={
            <ProtectedRoute>
              <Visitors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/add"
          element={
            <ProtectedRoute>
              <AddVisitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/edit/:id"
          element={
            <ProtectedRoute>
              <EditVisitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/view/:id"
          element={
            <ProtectedRoute>
              <ViewVisitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/history/:id"
          element={
            <ProtectedRoute>
              <VisitorHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/card/:id"
          element={
            <ProtectedRoute>
              <Card />
            </ProtectedRoute>
          }
        />
        {/* Other Routes */}
        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <Scanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-scanner"
          element={
            <ProtectedRoute>
              <PrintScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-kiosk"
          element={
            <ProtectedRoute>
              <PrintScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category"
          element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          }
        />
        <Route
          path="/card-designer"
          element={
            <ProtectedRoute>
              <CardDesigner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute>
              <ActivityLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invites"
          element={
            <ProtectedRoute>
              <Invites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invites/add"
          element={
            <ProtectedRoute>
              <AddInvite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invites/edit/:id"
          element={
            <ProtectedRoute>
              <EditInvite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/file-manager"
          element={
            <ProtectedRoute>
              <FileManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/photos"
          element={
            <ProtectedRoute>
              <Photos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Hotel Routes */}
        <Route
          path="/hotel"
          element={
            <ProtectedRoute>
              <Hotel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/requirements"
          element={
            <ProtectedRoute>
              <Requirements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/allot-dashboard"
          element={
            <ProtectedRoute>
              <AllotHotel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/allotment/edit/:id"
          element={
            <ProtectedRoute>
              <EditRoomAllotment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/add"
          element={
            <ProtectedRoute>
              <AddHotel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/edit/:id"
          element={
            <ProtectedRoute>
              <EditHotel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/view/:id"
          element={
            <ProtectedRoute>
              <ViewHotel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/allotment/:hotelId"
          element={
            <ProtectedRoute>
              <RoomAllotment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/reports"
          element={
            <ProtectedRoute>
              <SelectEventForReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotel/reports/:id"
          element={
            <ProtectedRoute>
              <ReportLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="room-category" replace />} />
          <Route path="room-category" element={<RoomCategorySummary />} />
          <Route path="pax" element={<PaxSummary />} />
          <Route path="hotel" element={<HotelSummary />} />
          <Route path="date" element={<DateSummary />} />
          <Route path="contact" element={<ContactSummary />} />
        </Route>
        {/* Travel Routes */}
        <Route
          path="/travel"
          element={
            <ProtectedRoute>
              <Travel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel/arrival"
          element={
            <ProtectedRoute>
              <AddTravel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel/departure"
          element={
            <ProtectedRoute>
              <AddTravel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel/edit/:id"
          element={
            <ProtectedRoute>
              <EditTravel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel/view/:id"
          element={
            <ProtectedRoute>
              <ViewTravel />
            </ProtectedRoute>
          }
        />
        {/* Driver Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <Driver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/add"
          element={
            <ProtectedRoute>
              <AddDriver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/edit/:id"
          element={
            <ProtectedRoute>
              <EditDriver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/reports"
          element={
            <ProtectedRoute>
              <DriverReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/view/:id"
          element={
            <ProtectedRoute>
              <ViewDriver />
            </ProtectedRoute>
          }
        />
        {/* Portal Routes */}
        <Route
          path="/portal"
          element={
            <PortalProtectedRoute>
              <PortalHome />
            </PortalProtectedRoute>
          }
        />
        <Route
          path="/portal/hotel"
          element={
            <PortalProtectedRoute allowedRoles={["hotel"]}>
              <PortalHotelDashboard />
            </PortalProtectedRoute>
          }
        />
        <Route
          path="/portal/hotel/visitors"
          element={
            <PortalProtectedRoute allowedRoles={["hotel"]}>
              <PortalHotelVisitors />
            </PortalProtectedRoute>
          }
        />
        <Route
          path="/portal/hotel/rooms"
          element={
            <PortalProtectedRoute allowedRoles={["hotel"]}>
              <PortalHotelRooms />
            </PortalProtectedRoute>
          }
        />
        <Route
          path="/portal/hotel/scan"
          element={
            <PortalProtectedRoute allowedRoles={["hotel"]}>
              <PortalHotelScan />
            </PortalProtectedRoute>
          }
        />
        <Route
          path="/portal/driver"
          element={
            <PortalProtectedRoute allowedRoles={["driver"]}>
              <PortalDriverDashboard />
            </PortalProtectedRoute>
          }
        />
        <Route
          path="/portal/travel"
          element={
            <PortalProtectedRoute allowedRoles={["travel"]}>
              <PortalTravelDashboard />
            </PortalProtectedRoute>
          }
        />
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
