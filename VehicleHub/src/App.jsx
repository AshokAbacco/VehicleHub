// VehicleHub/VehicleHub/src/App.jsx
import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';
import { SellerDashboardLayout } from './components/seller/SellerDashboardLayout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AuthGateProvider } from './context/AuthGateContext.jsx';
import { HomePage } from './pages/public/HomePage.jsx';
import { SearchPage } from './pages/public/SearchPage.jsx';
import { VehicleDetailPage } from './pages/public/VehicleDetailPage.jsx';
import { SellerRegistration } from './pages/public/SellerRegistrationPage.jsx';
import { AboutPage } from './pages/public/AboutPage.jsx';
import { ContactPage } from './pages/public/ContactPage.jsx';
import { ComparePage } from './pages/public/ComparePage.jsx';
import { WishlistPage } from './pages/public/WishlistPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { RegisterPage } from './pages/public/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage.jsx';
import { NotFoundPage } from './pages/public/NotFoundPage.jsx';
import { BuyerLayout } from './components/buyer/BuyerLayout.jsx';
import { BuyerWishlistPage } from './components/buyer/BuyerWishlistPage.jsx';
import { BuyerInquiriesPage } from './components/buyer/BuyerInquiriesPage.jsx';
import { BuyerOrdersPage } from './components/buyer/BuyerOrdersPage.jsx';
import { BuyerSettingsPage } from './components/buyer/BuyerSettingsPage.jsx';
import { BuyerNotification } from './components/buyer/BuyerNotification.jsx';
import { BuyerProfile } from './components/buyer/BuyerProfile.jsx';

import { BuyerDashboardPage } from './pages/dashboard/BuyerDashboardPage.jsx';
import { SellerDashboardPage } from './pages/dashboard/SellerDashboardPage.jsx';
import { AddVehicleForm } from './components/seller/AddVehicleForm.jsx';
import { InventoryOverviewTable } from './components/seller/InventoryOverviewTable.jsx';
import { DraftVehiclesPage } from './components/seller/DraftVehiclesPage.jsx';
import { PendingApprovalPage } from './components/seller/PendingApprovalPage.jsx';
import { ApprovedVehiclesPage } from './components/seller/ApprovedVehiclesPage.jsx';
import { RejectedVehiclesPage } from './components/seller/RejectedVehiclesPage.jsx';
import { ActiveListingsPage } from './components/seller/ActiveListingsPage.jsx';
import { SoldVehiclesPage } from './components/seller/SoldVehiclesPage.jsx';

import { InspectionRequestsPage } from './components/seller/InspectionRequestsPage.jsx';
import { InspectionDetailByID } from './components/field-inspector/InspectionDetailByID.jsx';
import { InvoicesPage } from './components/seller/InvoicesPage.jsx';
import { PaymentsPage } from './components/seller/PaymentsPage.jsx';
import { useAuthGate } from './context/AuthGateContext.jsx';

import { AddVehiclePage } from './components/admin/AddVehiclePage.jsx';

import { AllVehiclesPage } from './components/admin/AllVehiclesPage.jsx';
import { SellersPage } from './components/admin/SellersPage.jsx';
import { BuyersPage } from './components/admin/BuyersPage.jsx';
import { CartsPage } from './components/admin/CartsPage.jsx';
import { RevenuePage } from './components/admin/RevenuePage.jsx';
import { MessagesPage } from './components/admin/MessagesPage.jsx';
import { NotificationsPage } from './components/admin/NotificationsPage.jsx';


import { AdminDashboardLayout } from './components/admin/AdminDashboardLayout.jsx';
import { AdminDashboardPage } from './pages/dashboard/AdminDashboardPage.jsx';
import { VehicleApprovalsPage } from './components/admin/VehicleApprovalsPage.jsx';
import { AdminPaymentsPage } from './components/admin/AdminPaymentsPage.jsx';
// import { AdminMessagesPage } from './components/admin/AdminMessagesPage.jsx';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage.jsx';

// import { DocumentsPage } from './components/seller/DocumentsPage.jsx';
// import { TeamMembersPage } from './components/seller/sellerPagesMock.js';
import { Profile } from './components/auth/Profile.jsx';
import { SellerProfilePage } from './components/seller/SellerProfile.jsx';
import { SellerNotificationsPage } from './components/seller/SellerNotificationsPage.jsx';
import { SellerPurchaseRequestsPage } from './components/seller/SellerPurchaseRequestsPage.jsx';
import { DealerDashboardPage, DealerInventoryPage, DealerLeadsPage, DealerAnalyticsPage, DealerSettingsPage } from './pages/dashboard/DealerDashboardPage.jsx';
import { FinanceDashboardPage, FinanceLoansPage, FinancePaymentsPage, FinanceReportsPage, FinanceSettingsPage } from './pages/dashboard/FinanceDashboardPage.jsx';
import { SupportDashboardPage, SupportTicketsPage, SupportChatPage, SupportReportsPage, SupportSettingsPage } from './pages/dashboard/SupportDashboardPage.jsx';
import { SuperAdminDashboardPage, SuperAdminUsersPage, SuperAdminSecurityPage, SuperAdminAnalyticsPage, SuperAdminSettingsPage } from './pages/dashboard/SuperAdminDashboardPage.jsx';

// ---- Field Inspector module ----
import { FieldInspectorLayout } from './components/layout/FieldInspectorLayout.jsx';
import { FieldInspectorDashboard } from './pages/dashboard/FieldInspectorDashboard.jsx';
import { FieldInspectorInspections } from './components/field-inspector/FieldInspectorInspections.jsx';
import { PendingInspections } from './components/field-inspector/PendingInspections.jsx';
import { TodayInspections } from './components/field-inspector/TodayInspections.jsx';
import { InProgressInspections } from './components/field-inspector/InProgressInspections.jsx';
import { CompletedInspections } from './components/field-inspector/CompletedInspections.jsx';
import { FieldInspectorNotifications } from './components/field-inspector/FieldInspectorNotifications.jsx';
// import { FieldInspectorProfile } from './components/field-inspector/FieldInspectorProfile.jsx';
import { InspectionVerify } from './components/field-inspector/InspectionVerify.jsx'
import { InspectionReports as FieldInspectorReports } from './components/field-inspector/InspectionReports.jsx';
import { InspectionReportDetail as FieldInspectorReportDetail } from './components/field-inspector/InspectionReportDetail.jsx';
import { FieldInspectorProfile } from './components/field-inspector/FieldInspectorProfile.jsx';
import { InspectionCalendar } from './components/field-inspector/InspectionCalendar.jsx';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthGate();
  const normalizedUserRole = String(user?.role || user?.userRole || '').toLowerCase().replace(/-/g, '_');
  const normalizedAllowed = (allowedRoles || []).map((role) => String(role).toLowerCase().replace(/-/g, '_'));

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !normalizedAllowed.includes(normalizedUserRole)) return <Navigate to="/" replace />;
  return children;
};

const MainLayout = () => {
  // const { isAuthenticated } = useAuthGate();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/seller-Register" element={<SellerRegistration />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/compare" element={<ComparePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
};

const BuyerDashboardShell = () => <BuyerLayout />;

const SellerDashboardShell = () => (
  <SellerDashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to="/seller/dashboard" replace />} />
      <Route path="dashboard" element={<SellerDashboardPage />} />
      <Route path="dashboard/add-vehicle" element={<AddVehicleForm />} />
      <Route path="dashboard/inventory" element={<InventoryOverviewTable />} />
      <Route path="dashboard/draft-vehicles" element={<DraftVehiclesPage />} />
      <Route path="dashboard/pending-approval" element={<PendingApprovalPage />} />
      <Route path="dashboard/approved-vehicles" element={<ApprovedVehiclesPage />} />
      <Route path="dashboard/business-profile" element={<SellerProfilePage />} />
      <Route path="dashboard/rejected-vehicles" element={<RejectedVehiclesPage />} />
      <Route path="dashboard/active-listings" element={<ActiveListingsPage />} />
      <Route path="dashboard/sold-vehicles" element={<SoldVehiclesPage />} />
      <Route path="dashboard/inspection-requests" element={<InspectionRequestsPage />} />
      <Route path="dashboard/invoices" element={<InvoicesPage />} />
      <Route path="dashboard/payments" element={<PaymentsPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="dashboard/notifications" element={<SellerNotificationsPage />} />
      <Route path="dashboard/purchase-requests" element={<SellerPurchaseRequestsPage />} />
      {/* //================================ */}
      <Route path="dashboard/purchase-requests/:id" element={<InspectionDetailByID />} />
      <Route path="dashboard/purchase-requests/:id/verify" element={<InspectionVerify />} />
      <Route path="dashboard/purchase-requests/:id/reports" element={<FieldInspectorReports />} />
      <Route path="dashboard/purchase-requests/:id/reports/:reportId" element={<FieldInspectorReportDetail />} />
      <Route path="dashboard/purchase-requests/calendar" element={<InspectionCalendar />} />
      <Route path="dashboard/purchase-requests/profile" element={<FieldInspectorProfile />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </SellerDashboardLayout>
);

const AdminDashboardShell = () => (
  <AdminDashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="dashboard/vehicle-approvals" element={<VehicleApprovalsPage />} />
      <Route path="dashboard/all-vehicles" element={<AllVehiclesPage />} />
      <Route path="dashboard/add-vehicle" element={<AddVehiclePage />} />
      <Route path="dashboard/sellers" element={<SellersPage />} />
      <Route path="dashboard/buyers" element={<BuyersPage />} />
      <Route path="dashboard/carts" element={<CartsPage />} />
      <Route path="dashboard/revenue" element={<RevenuePage />} />

      <Route path="dashboard/payments" element={<AdminPaymentsPage />} />
      {/* <Route path="dashboard/messages" element={<AdminMessagesPage />} /> */}
      <Route path="dashboard/messages" element={<MessagesPage />} />
      <Route path="dashboard/notifications" element={<NotificationsPage />} />
      <Route path="dashboard/settings" element={<AdminSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AdminDashboardLayout>
);

const DealerDashboardShell = () => (
  <DashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to="/dealer/dashboard" replace />} />
      <Route path="dashboard" element={<DealerDashboardPage />} />
      <Route path="dashboard/inventory" element={<DealerInventoryPage />} />
      <Route path="dashboard/leads" element={<DealerLeadsPage />} />
      <Route path="dashboard/analytics" element={<DealerAnalyticsPage />} />
      <Route path="dashboard/settings" element={<DealerSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </DashboardLayout>
);

const FinanceDashboardShell = () => (
  <DashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to="/finance/dashboard" replace />} />
      <Route path="dashboard" element={<FinanceDashboardPage />} />
      <Route path="dashboard/loans" element={<FinanceLoansPage />} />
      <Route path="dashboard/payments" element={<FinancePaymentsPage />} />
      <Route path="dashboard/reports" element={<FinanceReportsPage />} />
      <Route path="dashboard/settings" element={<FinanceSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </DashboardLayout>
);

const SupportDashboardShell = () => (
  <DashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to="/support/dashboard" replace />} />
      <Route path="dashboard" element={<SupportDashboardPage />} />
      <Route path="dashboard/tickets" element={<SupportTicketsPage />} />
      <Route path="dashboard/chat" element={<SupportChatPage />} />
      <Route path="dashboard/reports" element={<SupportReportsPage />} />
      <Route path="dashboard/settings" element={<SupportSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </DashboardLayout>
);

const SuperAdminDashboardShell = () => (
  <DashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to="/super-admin/dashboard" replace />} />
      <Route path="dashboard" element={<SuperAdminDashboardPage />} />
      <Route path="dashboard/users" element={<SuperAdminUsersPage />} />
      <Route path="dashboard/security" element={<SuperAdminSecurityPage />} />
      <Route path="dashboard/analytics" element={<SuperAdminAnalyticsPage />} />
      <Route path="dashboard/settings" element={<SuperAdminSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </DashboardLayout>
);

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <AuthGateProvider>
                {/* zIndex above all modals (they use z-[9999]) so alerts are never hidden behind a popup */}
                <Toaster position="top-right" containerStyle={{ zIndex: 2147483647 }} />
                <Routes>
                  <Route path="/*" element={<MainLayout />} />
                  <Route
                    path="/buyer"
                    element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboardShell /></ProtectedRoute>}
                  >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<BuyerDashboardPage />} />
                    <Route path="dashboard/wishlist" element={<BuyerWishlistPage />} />
                    <Route path="dashboard/inquiries" element={<BuyerInquiriesPage />} />
                    <Route path="dashboard/orders" element={<BuyerOrdersPage />} />
                    <Route path="dashboard/notifications" element={<BuyerNotification />} />
                    <Route path="dashboard/profile" element={<BuyerProfile />} />
                    <Route path="dashboard/settings" element={<BuyerSettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                  <Route path="/seller/*" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboardShell /></ProtectedRoute>} />
                  <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardShell /></ProtectedRoute>} />
                  <Route path="/dealer/*" element={<ProtectedRoute allowedRoles={['dealer']}><DealerDashboardShell /></ProtectedRoute>} />
                  <Route path="/finance/*" element={<ProtectedRoute allowedRoles={['finance']}><FinanceDashboardShell /></ProtectedRoute>} />
                  <Route path="/support/*" element={<ProtectedRoute allowedRoles={['support']}><SupportDashboardShell /></ProtectedRoute>} />
                  <Route path="/super-admin/*" element={<ProtectedRoute allowedRoles={['super_admin', 'super-admin']}><SuperAdminDashboardShell /></ProtectedRoute>} />

                  {/* Field Inspector — protected, restricted to the FIELD_INSPECTOR role */}
                  <Route
                    path="/field-inspector"
                    element={
                      <ProtectedRoute allowedRoles={['field_inspector']}>
                        <FieldInspectorLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<FieldInspectorDashboard />} />
                    <Route path="inspections" element={<FieldInspectorInspections />} />
                    <Route path="inspections/pending" element={<PendingInspections />} />
                    <Route path="inspections/today" element={<TodayInspections />} />
                    <Route path="inspections/in-progress" element={<InProgressInspections />} />
                    <Route path="inspections/completed" element={<CompletedInspections />} />
                    <Route path="notifications" element={<FieldInspectorNotifications />} />
                    {/* <Route path="profile" element={<FieldInspectorProfile />} /> */}
                    <Route path="reports" element={<FieldInspectorReports />} />
                    <Route path="reports/:id" element={<FieldInspectorReportDetail />} />
                    <Route path="inspections/:id" element={<InspectionDetailByID />} />
                    <Route path="inspections/:id/verify" element={<InspectionVerify />} />
                    <Route path="profile" element={<FieldInspectorProfile />} />
                    <Route path="calendar" element={<InspectionCalendar />} />
                    {/* inspection detail, calendar, reports, messages, profile, settings — next round */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  <Route path="/dashboard/*" element={<ProtectedRoute><Navigate to="/buyer/dashboard" replace /></ProtectedRoute>} />
                </Routes>
              </AuthGateProvider>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default App