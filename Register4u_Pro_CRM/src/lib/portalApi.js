import axios from "axios";
import toast from "react-hot-toast";
import { PORTAL_API_BASE_URL } from "./api"; // Use centralized config

const portalApi = axios.create({
  baseURL: PORTAL_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "123",
  },
});

portalApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("portal_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest =
      requestUrl.includes("/login") || requestUrl.includes("/change-password");

    if (error.response) {
      const message = error.response.data?.message || "Something went wrong.";

      switch (error.response.status) {
        case 401:
          if (!isAuthRequest) {
            localStorage.removeItem("portal_token");
            localStorage.removeItem("portal_user");
            toast.error("Session expired. Please login again.");
            window.location.href = "/portal/login";
          } else {
            toast.error(message);
          }
          break;
        case 403:
          toast.error("You do not have permission to access this page.");
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);

export const portalAuthAPI = {
  login: (data) => portalApi.post("/login", data),
  me: () => portalApi.get("/me"),
  changePassword: (data) => portalApi.post("/change-password", data),
};

export const portalDashboardAPI = {
  hotel: () => portalApi.get("/hotel/dashboard"),
  driver: () => portalApi.get("/driver/dashboard"),
  travel: () => portalApi.get("/travel/dashboard"),
  hotelStats: () => portalApi.get("/hotel/stats"),
  driverStats: () => portalApi.get("/driver/stats"),
  travelStats: () => portalApi.get("/travel/stats"),
  // Lists
  getHotelVisitors: () => portalApi.get("/hotel/visitors"),
  getHotelRooms: () => portalApi.get("/hotel/rooms"),
  // Actions
  scanVisitor: (visitorId) => portalApi.post("/scan", { visitorId }),
};

export default portalApi;
