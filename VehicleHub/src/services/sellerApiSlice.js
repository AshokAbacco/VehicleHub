import { apiSlice } from "./apiSlice.js";

export const sellerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSellerDashboard: builder.query({
      query: () => "/dashboard/seller",
      providesTags: ["Dashboard"],
    }),

    createVehicle: builder.mutation({
      query: (payload) => ({
        url: "/vehicles",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    updateVehicle: builder.mutation({
      query: ({ id, formData, ...payload }) => ({
        url: `/vehicles/${id}`,
        method: "PUT",
        body: formData || payload,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    deleteVehicleImage: builder.mutation({
      query: ({ id, imageUrl }) => ({
        url: `/vehicles/${id}/images`,
        method: "DELETE",
        body: { imageUrl },
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getSellerOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Order"],
    }),

    registerSeller: builder.mutation({
      query: (payload) => ({
        url: "/sellers/register",
        method: "POST",
        body: payload,
      }),
    }),
    getSellerStatus: builder.query({
      query: (sellerId) => `/sellers/${sellerId}/seller-status`,
      providesTags: ["SellerStatus"],
    }),
    // getSellerInventory: builder.query({
    //   query: (sellerId) => `/sellers/${sellerId}/vehicles`,
    //   providesTags: ["Vehicle"],
    // }),
    getSellerInventory: builder.query({
      query: (arg) => {
        const value = typeof arg === "string" ? arg : arg?.status;
        const status =
          value &&
          [
            "draft",
            "pending",
            "under_verification",
            "approved",
            "rejected",
            "sold",
            "archived",
          ].includes(String(value).toLowerCase())
            ? String(value).toLowerCase()
            : undefined;

        return status
          ? `/vehicles/my/listings?status=${status}`
          : "/vehicles/my/listings";
      },
      providesTags: ["Vehicle"],
    }),

    deleteMyVehicle: builder.mutation({
      query: (id) => ({
        url: `/vehicles/my/listings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    approveVehicle: builder.mutation({
      query: (id) => ({
        url: `/vehicles/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    rejectVehicle: builder.mutation({
      query: (id) => ({
        url: `/vehicles/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    markVehicleSold: builder.mutation({
      query: (id) => ({
        url: `/vehicles/${id}/sold`,
        method: "PATCH",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getSellerStats: builder.query({
      query: () => "/sellers/me/stats",
      providesTags: ["Vehicle"],
    }),
    getSalesPerformance: builder.query({
      query: () => "/sellers/me/sales-performance",
      providesTags: ["Vehicle"],
    }),
    getSellerInquiries: builder.query({
      query: () => "/sellers/me/inquiries",
      providesTags: ["Vehicle"],
    }),
    getSellerInspections: builder.query({
      query: () => "/sellers/inspection-requests",
      providesTags: ["Inspection"],
    }),
    getSellerInspectionById: builder.query({
      query: (id) => `/sellers/inspection-requests/${id}`,
      providesTags: ["Inspection"],
    }),
    // Notification
    getSellerNotifications: builder.query({
      query: () => "/sellers/seller-notifications",
      providesTags: ["SellerNotification"],
    }),
    markSellerNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/sellers/seller-notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["SellerNotification"],
    }),
    markAllSellerNotificationsRead: builder.mutation({
      query: () => ({
        url: "/sellers/seller-notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["SellerNotification"],
    }),
    deleteSellerNotification: builder.mutation({
      query: (id) => ({
        url: `/sellers/seller-notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SellerNotification"],
    }),
    // =====================Seller Profile=========================
    getMyProfile: builder.query({
      query: () => "/sellers/me/profile",
      providesTags: ["SellerProfile"],
    }),
    updateMyProfile: builder.mutation({
      query: (formData) => ({
        url: "/sellers/me/profile",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["SellerProfile"],
    }),
    uploadMyDocuments: builder.mutation({
      query: (formData) => ({
        url: "/sellers/me/documents",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["SellerProfile"],
    }),
    deleteMyDocument: builder.mutation({
      query: (documentId) => ({
        url: `/sellers/me/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SellerProfile"],
    }),
    //======================== Purchase Requests==================================
    getPurchaseRequests: builder.query({
      query: () => "/sellers/purchase-requests",
      providesTags: ["PurchaseRequest"],
    }),
    getPurchaseRequestById: builder.query({
      query: (id) => `/sellers/purchase-requests/${id}`,
    }),
    acceptPurchaseRequest: builder.mutation({
      query: (id) => ({
        url: `/sellers/purchase-requests/${id}/accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["PurchaseRequest", "Vehicle"],
    }),
    rejectPurchaseRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/sellers/purchase-requests/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["PurchaseRequest"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSellerDashboardQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleImageMutation,
  useGetSellerOrdersQuery,
  useRegisterSellerMutation,
  useGetSellerStatusQuery,

  useGetSellerInventoryQuery,
  useDeleteMyVehicleMutation,

  useApproveVehicleMutation,
  useRejectVehicleMutation,
  useMarkVehicleSoldMutation,
  useGetSellerStatsQuery,
  useGetSalesPerformanceQuery,
  useGetSellerInquiriesQuery,
  useGetSellerInspectionsQuery,
  useGetSellerInspectionByIdQuery,

  // Notification
  useGetSellerNotificationsQuery,
  useMarkSellerNotificationReadMutation,
  useMarkAllSellerNotificationsReadMutation,
  useDeleteSellerNotificationMutation,
  // =====================Seller Profile=========================
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadMyDocumentsMutation,
  useDeleteMyDocumentMutation,
  //======================== Purchase Requests==================================
  useGetPurchaseRequestsQuery,
  useGetPurchaseRequestByIdQuery,
  useAcceptPurchaseRequestMutation,
  useRejectPurchaseRequestMutation,
} = sellerApi;
