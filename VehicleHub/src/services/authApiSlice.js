// VehicleHub/VehicleHub/src/services/authApiSlice.js
// Sign-in is email / mobile number + password (OTP sign-in has been removed).
import { apiSlice } from "./apiSlice.js";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // { identifier: email or mobile number, password } -> { data: { user, accessToken } }
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
    // { fullName, email, phone, password } -> new BUYER account { data: { user, accessToken } }
    register: builder.mutation({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    // ---- Forgot password (code emailed from the MotorDesk Microsoft 365 mailbox) ----
    // { identifier } -> { data: { sent, sentTo, resendIn, expiresInMinutes } }
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    // { identifier, otp } -> { data: { resetToken, expiresInMinutes } }
    verifyResetOtp: builder.mutation({
      query: (body) => ({ url: "/auth/verify-reset-otp", method: "POST", body }),
    }),
    // { resetToken, password, confirmPassword }
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    // ---- Settings page: own profile + address (every role) ----
    getAccount: builder.query({
      query: () => "/auth/account",
      providesTags: ["Account"],
    }),
    // { fullName, email, phone, address, city, state, pincode }
    updateAccount: builder.mutation({
      query: (body) => ({ url: "/auth/account", method: "PATCH", body }),
      invalidatesTags: ["Account", "User"],
    }),
    changePassword: builder.mutation({
      query: (payload) => ({
        url: "/auth/change-password",
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
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useGetAccountQuery,
  useUpdateAccountMutation,
} = authApi;