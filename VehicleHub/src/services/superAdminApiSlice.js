import { apiSlice } from './apiSlice.js';

export const superAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuperAdminDashboard: builder.query({
      query: () => '/dashboard/super-admin',
      providesTags: ['Dashboard'],
    }),
    getSystemUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getSecurityReports: builder.query({
      query: () => '/reports',
      providesTags: ['Report'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuperAdminDashboardQuery,
  useGetSystemUsersQuery,
  useGetSecurityReportsQuery,
} = superAdminApi;
