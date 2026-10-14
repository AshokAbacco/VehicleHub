import { apiSlice } from "./apiSlice.js";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getCurrentUser: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    register: builder.mutation({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    sendOTP: builder.mutation({
      query: (payload) => ({
        url: "/auth/phone/send-otp",
        method: "POST",
        body: payload,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (payload) => ({
        url: "/auth/phone/verify-otp",
        method: "POST",
        body: payload,
      }),
    }),

    // Email OTP endpoints
    sendEmailOtp: builder.mutation({
      query: (payload) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: payload,
      }),
    }),
    verifyEmailOtp: builder.mutation({
      query: (payload) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: payload,
      }),
    }),
    completeProfile: builder.mutation({
      query: (payload) => ({
        url: "/auth/complete-profile",
        method: "POST",
        body: payload,
      }),
    }),
    checkUserRole: builder.mutation({
      query: (payload) => ({
        url: "/users/check-role",
        method: "POST",
        body: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRegisterMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,

  // Email OTP hooks
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useCompleteProfileMutation,
  // User role check hook
  useCheckUserRoleMutation,
} = authApi;
