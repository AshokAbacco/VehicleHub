// import { apiSlice } from './apiSlice.js';

// export const buyerApi = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     getBuyerDashboard: builder.query({
//       query: () => '/dashboard/buyer',
//       providesTags: ['Dashboard'],
//     }),
//     getBuyerOrders: builder.query({
//       query: () => '/orders',
//       providesTags: ['Order'],
//     }),
//     getBuyerInquiries: builder.query({
//       query: () => '/inquiries',
//       providesTags: ['Inquiry'],
//     }),
//     getBuyerWishlist: builder.query({
//       query: () => '/wishlist',
//       providesTags: ['Vehicle'],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetBuyerDashboardQuery,
//   useGetBuyerOrdersQuery,
//   useGetBuyerInquiriesQuery,
//   useGetBuyerWishlistQuery,
// } = buyerApi;

import { apiSlice } from "./apiSlice.js";

export const buyerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuyerStats: builder.query({ query: () => "/buyer/dashboard" }),
    getWishlist: builder.query({
      query: () => "/buyer/wishlist",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation({
      query: (vehicleListingId) => ({
        url: "/buyer/wishlist",
        method: "POST",
        body: { vehicleListingId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (vehicleListingId) => ({
        url: `/buyer/wishlist/${vehicleListingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    getMyInquiries: builder.query({ query: () => "/buyer/inquiries" }),
    getBuyerProfile: builder.query({ query: () => "/buyer/profile" }),
    getBuyerNotifications: builder.query({
      query: () => "/buyer/notifications",
      providesTags: ["Notification"],
    }),
    markBuyerNotificationRead: builder.mutation({
      query: (id) => ({ url: `/buyer/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    markAllBuyerNotificationsRead: builder.mutation({
      query: () => ({ url: "/buyer/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    updateBuyerProfile: builder.mutation({
      query: (body) => ({ url: "/buyer/profile", method: "PATCH", body }),
    }),
    //============== Purchase Requests==========================
    createPurchaseRequest: builder.mutation({
      query: (body) => ({
        url: "/buyer/purchase-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseRequest"],
    }),
    getMyPurchaseRequests: builder.query({
      query: () => "/buyer/purchase-requests",
      providesTags: ["PurchaseRequest"],
    }),
    cancelPurchaseRequest: builder.mutation({
      query: (id) => ({
        url: `/buyer/purchase-requests/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["PurchaseRequest"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBuyerStatsQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetMyInquiriesQuery,
  useGetBuyerProfileQuery,
  useGetBuyerNotificationsQuery,
  useMarkBuyerNotificationReadMutation,
  useMarkAllBuyerNotificationsReadMutation,
  useUpdateBuyerProfileMutation,

  // Purchase Requests
  useCreatePurchaseRequestMutation,
  useGetMyPurchaseRequestsQuery,
  useCancelPurchaseRequestMutation,
} = buyerApi;
