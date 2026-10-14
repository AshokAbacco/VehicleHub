import { apiSlice } from "./apiSlice.js";

export const vehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHomepageVehicles: builder.query({ query: () => "/vehicles/homepage" }),
    getVehicles: builder.query({
      query: () => "/vehicles?status=APPROVED&limit=100",
    }),
    getVehicleById: builder.query({ query: (id) => `/vehicles/${id}` }),
  }),
  overrideExisting: false,
});

export const {
  useGetHomepageVehiclesQuery,
  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
} = vehicleApi;
