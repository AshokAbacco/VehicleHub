// VehicleHub/VehicleHub/src/services/adminApiSlice.js
// Admin panel API (server: VehicleHub_Server/src/routes/adminRoutes.js, ADMIN role only).
// Every admin page reads real database data through these endpoints.
import { apiSlice } from './apiSlice.js';

// Anything an admin changes refreshes all admin screens (counts, badges, lists)
const ADMIN = ['AdminData'];

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------- Dashboard ----------------
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ADMIN,
    }),

    // ---------------- Vehicles ----------------
    getAdminVehicles: builder.query({
      query: (search) => (search ? `/admin/vehicles?search=${encodeURIComponent(search)}` : '/admin/vehicles'),
      providesTags: [...ADMIN, 'Vehicle'],
    }),
    deleteAdminVehicle: builder.mutation({
      query: (id) => ({ url: `/admin/vehicles/${id}`, method: 'DELETE' }),
      invalidatesTags: [...ADMIN, 'Vehicle'],
    }),
    // Admin "Add Vehicle" uses the same endpoint as sellers (admins' listings go live directly)
    createAdminVehicle: builder.mutation({
      query: (formData) => ({ url: '/vehicles', method: 'POST', body: formData }),
      invalidatesTags: [...ADMIN, 'Vehicle'],
    }),
    getPendingVehicles: builder.query({
      query: () => '/vehicles/admin/pending',
      providesTags: [...ADMIN, 'Vehicle'],
    }),
    // Unique names: sellerApiSlice also defines approveVehicle / rejectVehicle (taking a plain id) and,
    // sharing one apiSlice, the first definition won — so admin rejections went to /vehicles/[object Object]/reject.
    adminApproveVehicle: builder.mutation({
      query: (id) => ({ url: `/vehicles/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: [...ADMIN, 'Vehicle', 'Dashboard'],
    }),
    adminRejectVehicle: builder.mutation({
      query: ({ id, reason }) => ({ url: `/vehicles/${id}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: [...ADMIN, 'Vehicle', 'Dashboard'],
    }),

    // ---------------- Sellers (applications + approved sellers) ----------------
    // status: APPROVED (default) | PENDING | REJECTED | ALL
    getAdminSellers: builder.query({
      query: ({ status = 'APPROVED', search = '' } = {}) =>
        `/admin/sellers?status=${status}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      providesTags: ADMIN,
    }),
    getPendingSellers: builder.query({
      query: () => '/admin/sellers/pending',
      providesTags: ADMIN,
    }),
    getPendingSellerCount: builder.query({
      query: () => '/admin/sellers/notifications-count',
      providesTags: ADMIN,
    }),
    getSellerRegistrationDetail: builder.query({
      query: (id) => `/admin/sellers/${id}`,
      providesTags: ADMIN,
    }),
    approveSeller: builder.mutation({
      query: (id) => ({ url: `/admin/sellers/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ADMIN,
    }),
    rejectSeller: builder.mutation({
      query: ({ id, reason }) => ({ url: `/admin/sellers/${id}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ADMIN,
    }),

    // ---------------- Buyers ----------------
    getAdminBuyers: builder.query({
      query: () => '/admin/buyers',
      providesTags: [...ADMIN, 'AdminBuyers'],
    }),
    deleteAdminBuyer: builder.mutation({
      query: (id) => ({ url: `/admin/buyers/${id}`, method: 'DELETE' }),
      invalidatesTags: [...ADMIN, 'AdminBuyers'],
    }),

    // ---------------- Carts, revenue, orders & sales ----------------
    getAdminCarts: builder.query({
      query: () => '/admin/carts',
      providesTags: ADMIN,
    }),
    getAdminRevenue: builder.query({
      query: () => '/admin/revenue',
      providesTags: ADMIN,
    }),
    getAdminOrders: builder.query({
      query: () => '/admin/orders',
      providesTags: ADMIN,
    }),

    // ---------------- Admin's own notifications ----------------
    getAdminNotifications: builder.query({
      query: () => '/admin/notifications',
      providesTags: ADMIN,
    }),
    markAdminNotificationRead: builder.mutation({
      query: (id) => ({ url: `/admin/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ADMIN,
    }),
    markAllAdminNotificationsRead: builder.mutation({
      query: () => ({ url: '/admin/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ADMIN,
    }),

    // ---------------- Messages ----------------
    getAdminConversations: builder.query({
      query: () => '/admin/conversations',
      providesTags: ADMIN,
    }),
    sendAdminMessage: builder.mutation({
      query: ({ conversationId, text }) => ({ url: `/admin/conversations/${conversationId}/messages`, method: 'POST', body: { text } }),
      invalidatesTags: ADMIN,
    }),
    markAdminConversationRead: builder.mutation({
      query: (conversationId) => ({ url: `/admin/conversations/${conversationId}/read`, method: 'PATCH' }),
      invalidatesTags: ADMIN,
    }),

    // ---------------- Field inspections ----------------
    getInspectors: builder.query({
      query: () => '/admin/inspectors',
      providesTags: ADMIN,
    }),
    getAdminInspections: builder.query({
      query: (vehicleId) => (vehicleId ? `/admin/inspections?vehicleId=${vehicleId}` : '/admin/inspections'),
      providesTags: ADMIN,
    }),
    // body: { vehicleId, inspectorId, scheduledAt, priority, deadline }
    assignInspection: builder.mutation({
      query: (body) => ({ url: '/admin/inspections', method: 'POST', body }),
      invalidatesTags: ADMIN,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminDashboardQuery,

  useGetAdminVehiclesQuery,
  useDeleteAdminVehicleMutation,
  useCreateAdminVehicleMutation,
  useGetPendingVehiclesQuery,
  useAdminApproveVehicleMutation: useApproveVehicleMutation,
  useAdminRejectVehicleMutation: useRejectVehicleMutation,

  useGetAdminSellersQuery,
  useGetPendingSellersQuery,
  useGetPendingSellerCountQuery,
  useGetSellerRegistrationDetailQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,

  useGetAdminBuyersQuery,
  useDeleteAdminBuyerMutation,

  useGetAdminCartsQuery,
  useGetAdminRevenueQuery,
  useGetAdminOrdersQuery,

  useGetAdminNotificationsQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,

  useGetAdminConversationsQuery,
  useSendAdminMessageMutation,
  useMarkAdminConversationReadMutation,

  useGetInspectorsQuery,
  useGetAdminInspectionsQuery,
  useAssignInspectionMutation,
} = adminApi;