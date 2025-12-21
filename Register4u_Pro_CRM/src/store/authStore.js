import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      employee: null,
      token: null,
      userType: null, // 'admin', 'employee', 'driver', 'hotel', 'travel'
      role: null, // 'admin', 'permanent_employee', 'volunteer', 'driver', 'hotel_staff', 'travel_coordinator'
      isAuthenticated: false,

      login: (userData, token, userType = null) => {
        // Auto-detect user type from response if not provided
        const detectedUserType = userType || userData.user?.type || 'admin';
        
        const state = {
          token,
          userType: detectedUserType,
          isAuthenticated: true,
        };

        if (detectedUserType === 'admin') {
          state.user = userData.user;
          state.employee = null;
          state.role = 'admin';
        } else if (detectedUserType === 'employee') {
          state.user = null;
          state.employee = userData.user; // In new format, user data is in userData.user
          state.role = userData.user?.role || 'permanent_employee';
        } else {
          // For future user types (driver, hotel, travel)
          state.user = userData.user;
          state.employee = null;
          state.role = userData.user?.role || detectedUserType;
        }

        set(state);
        localStorage.setItem("token", token);
        localStorage.setItem("userType", detectedUserType);
        localStorage.setItem("userData", JSON.stringify(userData));
      },

      logout: () => {
        set({
          user: null,
          employee: null,
          token: null,
          userType: null,
          role: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userData");
      },

      updateUser: (userData) => {
        const { userType } = get();
        if (userType === 'admin') {
          set({ user: userData });
        } else {
          set({ employee: userData });
        }
        localStorage.setItem("userData", JSON.stringify(userData));
      },

      updateEmployee: (employeeData) => {
        set({ employee: employeeData });
        localStorage.setItem("userData", JSON.stringify({ employee: employeeData }));
      },

      // Helper methods
      isAdmin: () => {
        const { userType, role } = get();
        return userType === 'admin' || role === 'admin';
      },

      isEmployee: () => {
        const { userType } = get();
        return userType === 'employee';
      },

      isPermanentEmployee: () => {
        const { role } = get();
        return role === 'permanent_employee';
      },

      isVolunteer: () => {
        const { role } = get();
        return role === 'volunteer';
      },

      getCurrentUser: () => {
        const { user, employee, userType } = get();
        if (userType === 'admin') return user;
        if (userType === 'employee') return employee;
        return user; // For other user types
      },

      hasPermission: (module, action = 'read') => {
        const { role } = get();
        
        const permissions = {
          admin: {
            dashboard: ['read', 'write', 'delete'],
            employees: ['read', 'write', 'delete'],
            organizations: ['read', 'write', 'delete'],
            events: ['read', 'write', 'delete'],
            visitors: ['read', 'write', 'delete'],
            scanner: ['read', 'write'],
            settings: ['read', 'write'],
            users: ['read', 'write', 'delete']
          },
          permanent_employee: {
            dashboard: ['read'],
            visitors: ['read', 'write', 'delete'],
            scanner: ['read', 'write'],
            profile: ['read', 'write']
          },
          volunteer: {
            dashboard: ['read'],
            visitors: ['read', 'write'], // No delete for volunteers
            scanner: ['read', 'write'],
            profile: ['read', 'write']
          }
        };

        return permissions[role]?.[module]?.includes(action) || false;
      },

      canAccess: (module) => {
        const { role } = get();
        
        const moduleAccess = {
          admin: ['dashboard', 'employees', 'organizations', 'events', 'visitors', 'scanner', 'settings', 'users'],
          permanent_employee: ['dashboard', 'visitors', 'scanner', 'profile'],
          volunteer: ['dashboard', 'visitors', 'scanner', 'profile']
        };

        return moduleAccess[role]?.includes(module) || false;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
