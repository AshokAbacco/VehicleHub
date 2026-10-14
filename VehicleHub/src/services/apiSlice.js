// VehicleHub/VehicleHub/src/services/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const apiBaseUrl = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("vehiclehub_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: [
    "User",
    "Vehicle",
    "VehicleList",
    "Wishlist",
    "Order",
    "Inquiry",
    "Dashboard",
    "Notification",
    "Report",
    "PurchaseRequest",
    "AdminBuyers",
  ],
  endpoints: () => ({}),
});