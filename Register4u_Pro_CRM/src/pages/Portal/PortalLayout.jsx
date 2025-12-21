import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import {
  HomeIcon,
  UserGroupIcon,
  QrCodeIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// --- Internal Components to match Admin Structure ---

const PortalSidebar = ({ isOpen, onClose, navigation }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Register4u Pro
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              // Ensure active state logic works for nested routes too
              const isActive =
                location.pathname === item.href ||
                (item.href !== navigation[0].href &&
                  location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Register4u Pro
          </p>
        </div>
      </div>
    </>
  );
};

const PortalHeader = ({ onMenuClick, user, onChangePassword, logout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const displayName = user?.name || user?.loginId || "User";

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 lg:px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Welcome back, {displayName}!
            </h2>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.role?.toUpperCase()}
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {user?.loginId}
                    </p>
                  </div>

                  {onChangePassword && (
                    <button
                      onClick={() => {
                        onChangePassword();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      Change Password
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Main Layout ---

const PortalLayout = ({ title, children, onChangePassword }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = usePortalAuthStore((state) => state.logout);
  const user = usePortalAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/portal/login");
  };

  const role = user?.role || "hotel";
  // Determine base path based on role.
  // Note: For 'hotel', dashboard is '/portal/hotel'.
  // For others, it might be different.
  const basePath = `/portal/${role}`;

  const navigation = [
    { name: "Dashboard", href: basePath, icon: HomeIcon },
    { name: "Visitors", href: `${basePath}/visitors`, icon: UserGroupIcon },
    { name: "Scan", href: `${basePath}/scan`, icon: QrCodeIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <PortalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PortalHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onChangePassword={onChangePassword}
          logout={handleLogout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
