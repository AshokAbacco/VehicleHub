// VehicleHub/VehicleHub/src/services/pricingApiSlice.js
// Pricing page: plans, Razorpay order, and backend payment verification.
// Only the public Razorpay key id ever reaches the browser (it comes back with the order).
import { apiSlice } from "./apiSlice.js";

export const pricingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPricingPlans: builder.query({
      query: () => "/pricing/plans",
    }),
    createPlanOrder: builder.mutation({
      query: (body) => ({ url: "/pricing/order", method: "POST", body }),
    }),
    verifyPlanPayment: builder.mutation({
      query: (body) => ({ url: "/pricing/verify", method: "POST", body }),
    }),
    // Is this email / phone already registered? (the order endpoint checks again)
    checkPlanAccount: builder.mutation({
      query: (body) => ({ url: "/pricing/check-account", method: "POST", body }),
    }),
  }),
});

export const { useGetPricingPlansQuery, useCreatePlanOrderMutation, useVerifyPlanPaymentMutation, useCheckPlanAccountMutation } = pricingApiSlice;

// Same prices as the backend (used until /pricing/plans loads). The backend always
// recalculates the amount — these are for display only.
export const PLAN_MONTHLY_PRICE = { URBAN: 500, RURAL: 350 };
export const PLAN_DURATIONS = [
  { months: 1, label: "Month" },
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
  { months: 12, label: "Yearly" },
];

/** Where the paid plan is kept until seller registration is submitted. */
export const PLAN_PREFILL_KEY = "vehiclehub_plan_prefill";

export const savePlanPrefill = (value) => {
  try { sessionStorage.setItem(PLAN_PREFILL_KEY, JSON.stringify(value)); } catch { /* private mode */ }
};
export const readPlanPrefill = () => {
  try { return JSON.parse(sessionStorage.getItem(PLAN_PREFILL_KEY) || "null"); } catch { return null; }
};
export const clearPlanPrefill = () => {
  try { sessionStorage.removeItem(PLAN_PREFILL_KEY); } catch { /* ignore */ }
};