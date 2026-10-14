import { apiSlice } from './apiSlice.js';

export const dealerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDealerDashboard: builder.query({
      query: () => '/dashboard/dealer',
      providesTags: ['Dashboard'],
    }),
    getDealerInventory: builder.query({
      query: () => '/vehicles',
      providesTags: ['Vehicle'],
    }),
    getDealerLeads: builder.query({
      query: () => '/inquiries',
      providesTags: ['Inquiry'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDealerDashboardQuery,
  useGetDealerInventoryQuery,
  useGetDealerLeadsQuery,
} = dealerApi;
