// VehicleHub/VehicleHub/src/services/adminApiSlice.js
import { apiSlice } from './apiSlice.js';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => "/dashboard/admin",
      providesTags: ["Dashboard"],
    }),
    getAllUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
    getReports: builder.query({
      query: () => "/reports",
      providesTags: ["Report"],
    }),
    getPendingVehicles: builder.query({
      query: () => "/vehicles/admin/pending",
      providesTags: ["Vehicle"],
    }),
    approveVehicle: builder.mutation({
      query: (id) => ({ url: `/vehicles/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["Vehicle", "Dashboard"],
    }),
    rejectVehicle: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/vehicles/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Vehicle", "Dashboard"],
    }),
    //=====================ADMIN BUYERS================================
    getAdminBuyers: builder.query({
      query: () => "/admin/buyers",
      providesTags: ["AdminBuyers"],
    }),
    deleteAdminBuyer: builder.mutation({
      query: (id) => ({ url: `/admin/buyers/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminBuyers"],
    }),
    //=====================ADMIN SELLER VERIFICATION================================
    getPendingSellerCount: builder.query({
      query: () => "/admin/sellers/notifications-count",
      providesTags: ["PendingSellerCount"],
    }),
    getPendingSellers: builder.query({
      query: () => "/admin/sellers/pending",
      providesTags: ["PendingSellers"],
    }),
    getSellerRegistrationDetail: builder.query({
      query: (id) => `/admin/sellers/${id}`,
      providesTags: ["PendingSellers"],
    }),
    approveSeller: builder.mutation({
      query: (id) => ({
        url: `/admin/sellers/${id}/approve`,
        method: "PATCH",
      }),
      providesTags: ["PendingSellers"],
    }),
    rejectSeller: builder.mutation({
      query: (id, reason) => ({
        url: `/admin/sellers/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      providesTags: ["PendingSellers"],
    }),
    



  }),
  overrideExisting: false,
});

export const {
  useGetAdminDashboardQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useGetReportsQuery,
  useGetPendingVehiclesQuery,
  useApproveVehicleMutation,
  useRejectVehicleMutation,

  useGetAdminBuyersQuery,
  useDeleteAdminBuyerMutation,

  useGetPendingSellerCountQuery,
  useGetPendingSellersQuery,
  useGetSellerRegistrationDetailQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
  
} = adminApi;