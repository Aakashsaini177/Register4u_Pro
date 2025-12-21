import { create } from "zustand";
import { settingsAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

export const usePortalSettingsStore = create((set, get) => ({
  driverFields: {
    contact: true,
    vehicle: true,
    trips: true,
    salary: false,
  },
  hotelFields: {
    contact: true,
    roomCategory: true,
    allotments: true,
    pricing: false,
  },
  isLoading: false,

  // Fetch settings from API
  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await settingsAPI.getPortalSettings();
      if (response.data.success) {
        set({
          driverFields: response.data.data.driverFields,
          hotelFields: response.data.data.hotelFields,
        });
      }
    } catch (error) {
      console.error("Failed to fetch portal settings", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update settings via API
  updateSettings: async (newDriverFields, newHotelFields) => {
    try {
      const response = await settingsAPI.updatePortalSettings({
        driverFields: newDriverFields,
        hotelFields: newHotelFields,
      });
      if (response.data.success) {
        set({
          driverFields: response.data.data.driverFields,
          hotelFields: response.data.data.hotelFields,
        });
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings");
    }
  },

  toggleDriverField: (field) => {
    const { driverFields, hotelFields, updateSettings } = get();
    const newFields = { ...driverFields, [field]: !driverFields[field] };
    set({ driverFields: newFields });
    updateSettings(newFields, hotelFields);
  },

  toggleHotelField: (field) => {
    const { driverFields, hotelFields, updateSettings } = get();
    const newFields = { ...hotelFields, [field]: !hotelFields[field] };
    set({ hotelFields: newFields });
    updateSettings(driverFields, newFields);
  },
}));
