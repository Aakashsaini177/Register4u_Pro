import React, { useState } from "react";
import {
  CogIcon,
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      id: "general",
      name: "General",
      icon: CogIcon,
      description: "General settings",
    },
    {
      id: "portal",
      name: "Portal Visibility",
      icon: EyeIcon,
      description: "Control Dashboard Visibility",
    },
    {
      id: "profile",
      name: "Profile",
      icon: UserCircleIcon,
      description: "User profile",
    },
    {
      id: "security",
      name: "Security",
      icon: KeyIcon,
      description: "Password & security",
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: BellIcon,
      description: "Email & SMS alerts",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage system preferences and configurations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    activeTab === tab.id
                      ? "text-indigo-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12 text-gray-500 dark:text-gray-400">
                <CogIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>General settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12 text-gray-500 dark:text-gray-400">
                <UserCircleIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Profile settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "portal" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PortalVisibilitySettings />
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12 text-gray-500 dark:text-gray-400">
                <KeyIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Security settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BellIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Notification settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for clean code
import { usePortalSettingsStore } from "@/store/portalSettingsStore";

const PortalVisibilitySettings = () => {
  const {
    driverFields,
    hotelFields,
    toggleDriverField,
    toggleHotelField,
    fetchSettings,
  } = usePortalSettingsStore();

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Driver Portal Visibility</CardTitle>
          <p className="text-sm text-gray-500">
            Control what drivers can see on their dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(driverFields).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100 dark:border-gray-800"
            >
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <div
                className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors ${
                  value ? "bg-green-500" : ""
                }`}
                onClick={() => toggleDriverField(key)}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                    value ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Portal Visibility</CardTitle>
          <p className="text-sm text-gray-500">
            Control what hotel staff can see on their dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(hotelFields).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100 dark:border-gray-800"
            >
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <div
                className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors ${
                  value ? "bg-green-500" : ""
                }`}
                onClick={() => toggleHotelField(key)}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                    value ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default Settings;
