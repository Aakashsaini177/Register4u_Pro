import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  QrCodeIcon,
  FolderIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  TicketIcon,
  PrinterIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "permanent_employee", "volunteer"],
  },
  { name: "Employees", href: "/employee", icon: UsersIcon, roles: ["admin"] },
  {
    name: "Companies",
    href: "/company",
    icon: BuildingOfficeIcon,
    roles: ["admin"],
  },
  { name: "Events", href: "/event", icon: CalendarIcon, roles: ["admin"] },
  {
    name: "Employee Tasks",
    href: "/employee-task",
    icon: ClipboardDocumentListIcon,
    roles: ["admin", "permanent_employee"],
  },
  {
    name: "Visitors",
    href: "/visitors",
    icon: UserGroupIcon,
    roles: ["admin", "permanent_employee", "volunteer"],
  },
  {
    name: "Hotels",
    href: "/hotel",
    icon: BuildingOffice2Icon,
    roles: ["admin", "permanent_employee"],
  },
  {
    name: "Travel",
    href: "/travel",
    icon: MapPinIcon,
    roles: ["admin", "permanent_employee"],
  },
  {
    name: "Drivers",
    href: "/driver",
    icon: TruckIcon,
    roles: ["admin", "permanent_employee"],
  },
  {
    name: "Scanner",
    href: "/scanner",
    icon: QrCodeIcon,
    roles: ["admin", "permanent_employee", "volunteer"],
  },
  {
    name: "Print Kiosk",
    href: "/print-scanner",
    icon: PrinterIcon,
    roles: ["admin", "permanent_employee"],
  },
  { name: "Invites", href: "/invites", icon: TicketIcon, roles: ["admin"] },
  {
    name: "File Manager",
    href: "/file-manager",
    icon: FolderIcon,
    roles: ["admin"],
  },
  {
    name: "Card Designer",
    href: "/card-designer",
    icon: CreditCardIcon,
    roles: ["admin"],
  },
  { name: "Category", href: "/category", icon: FolderIcon, roles: ["admin"] },
  { name: "Photos", href: "/photos", icon: PhotoIcon, roles: ["admin"] },
  {
    name: "Activity Logs",
    href: "/activity-logs",
    icon: ClockIcon,
    roles: ["admin"],
  },
  // Explicit Profile Menu Item
  {
    name: "Profile",
    href: "/profile",
    icon: UserCircleIcon,
    roles: ["admin", "permanent_employee", "volunteer"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Cog6ToothIcon,
    roles: ["admin"],
  },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { role } = useAuthStore();

  // Filter navigation based on role
  const filteredNavigation = navigation
    .filter((item) => {
      if (!role) return false;
      // If roles array exists, check if user role is included
      if (item.roles) {
        return item.roles.includes(role);
      }
      // Default to admin only if no roles specified (safety fallback)
      return role === "admin";
    })
    .map((item) => {
      // Dynamic href adjustments
      if (
        item.name === "Dashboard" &&
        (role === "permanent_employee" || role === "volunteer")
      ) {
        return { ...item, href: "/employee/dashboard" };
      }
      return item;
    });

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0",
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
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
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
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
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
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Register4u Pro
          </p>
        </div>
      </div>
    </>
  );
};
