import { apiSlice } from "./apiSlice.js";

const fieldInspectorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInspectorDashboard: builder.query({
      query: () => "field-inspector/dashboard/inspector",
      providesTags: ["Dashboard"],
    }),
    getTodaySchedule: builder.query({
      query: () => "field-inspector/dashboard/today-schedule",
      providesTags: ["TodaySchedule"],
    }),
    getPendingInspections: builder.query({
      query: () => "field-inspector/dashboard/pending-inspections",
      providesTags: ["PendingInspections"],
    }),
    getUpcomingInspections: builder.query({
      query: () => "field-inspector/dashboard/upcoming-inspections",
      providesTags: ["UpcomingInspections"],
    }),
    getRecentCompleted: builder.query({
      query: () => "field-inspector/dashboard/recent-completed",
      providesTags: ["RecentCompleted"],
    }),
    getMyInspections: builder.query({
      query: (params) => ({
        url: "field-inspector/inspections/my-inspections",
        params,
      }),
      providesTags: ["MyInspections"],
    }),
    getInProgressInspections: builder.query({
      query: () => "field-inspector/inspections/in-progress",
      providesTags: ["InProgressInspections"],
    }),
    getCompletedInspections: builder.query({
      query: () => "field-inspector/inspections/completed",
      providesTags: ["CompletedInspections"],
    }),
    getInspectionById: builder.query({
      query: (inspectionId) => `field-inspector/inspections/${inspectionId}`,
      providesTags: ["InspectionById"],
    }),
    acceptInspection: builder.mutation({
      query: (inspectionId) => ({
        url: `field-inspector/inspections/${inspectionId}/accept`,
        method: "POST",
      }),
      invalidatesTags: [
        "InspectionById",
        "MyInspections",
        "PendingInspections",
        "TodaySchedule",
        "Dashboard",
      ],
    }),
    startInspection: builder.mutation({
      query: (inspectionId) => ({
        url: `field-inspector/inspections/${inspectionId}/start`,
        method: "POST",
      }),
      invalidatesTags: [
        "InspectionById",
        "MyInspections",
        "PendingInspections",
        "InProgressInspections",
        "TodaySchedule",
        "Dashboard",
      ],
    }),
    getNotifications: builder.query({
      query: () => "field-inspector/notifications",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `field-inspector/notifications/${notificationId}/read`,
        method: "POST",
      }),
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "field-inspector/notifications/read",
        method: "POST",
      }),
    }),
    getProfile: builder.query({
      query: () => "field-inspector/profile",
      providesTags: ["Profile"],
    }),
    getInspectorReports: builder.query({
      query: (params) => ({ url: "/field-inspector/reports", params }),
    }),
    getInspectorReportById: builder.query({
      query: (id) => `/field-inspector/reports/${id}`,
    }),
    saveDraft: builder.mutation({
      query: (id) => ({
        url: `field-inspector/inspections/${id}/draft`,
        method: "PATCH",
      }),
    }),
    updateSellerVerification: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/seller-verification`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    updateDocumentVerification: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/document-verification`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    updateVehicleIdentity: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/vehicle-identity`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    updateVehicleCheck: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/vehicle-check`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    updateTestDrive: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/test-drive`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    updateLocation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/location`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    uploadInspectionPhotos: builder.mutation({
      query: ({ id, formData }) => ({
        url: `field-inspector/inspections/${id}/photos`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["InspectionById"],
    }),
    deleteInspectionPhoto: builder.mutation({
      query: ({ id, photoId }) => ({
        url: `field-inspector/inspections/${id}/photos/${photoId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InspectionById"],
    }),
    submitInspection: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `field-inspector/inspections/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "InspectionById",
        "CompletedInspections",
        "InProgressInspections",
      ],
    }),
    updateInspectorProfile: builder.mutation({
      query: (body) => ({
        url: "field-inspector/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    changeInspectorPassword: builder.mutation({
      query: (body) => ({
        url: "field-inspector/profile/change-password",
        method: "POST",
        body,
      }),
    }),
    getCalendarInspections: builder.query({
      query: (params) => ({ url: "field-inspector/calendar", params }),
      providesTags: ["Inspection"],
    }),
  }),
  overrideExisting: false,
});

export const {
  // useGetDashboardStatsQuery,
  useGetInspectorDashboardQuery,
  useGetTodayScheduleQuery,
  useGetPendingInspectionsQuery,
  useGetUpcomingInspectionsQuery,
  useGetRecentCompletedQuery,

  useGetMyInspectionsQuery,
  useGetInProgressInspectionsQuery,
  useGetCompletedInspectionsQuery,
  useGetInspectionByIdQuery,
  useAcceptInspectionMutation,
  useStartInspectionMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetProfileQuery,

  useGetInspectorReportsQuery,
  useGetInspectorReportByIdQuery,
  // Inspection Mutations
  useSaveDraftMutation,
  useUpdateSellerVerificationMutation,
  useUpdateDocumentVerificationMutation,
  useUpdateVehicleIdentityMutation,
  useUpdateVehicleCheckMutation,
  useUpdateTestDriveMutation,
  useUpdateLocationMutation,
  useUploadInspectionPhotosMutation,
  useSubmitInspectionMutation,
  useUpdateInspectorProfileMutation,
  useChangeInspectorPasswordMutation,
  useGetCalendarInspectionsQuery,
} = fieldInspectorApiSlice;
