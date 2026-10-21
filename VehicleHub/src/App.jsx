// VehicleHub/VehicleHub/src/App.jsx
import './App.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { SellerDashboardLayout } from './components/seller/SellerDashboardLayout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AuthGateProvider } from './context/AuthGateContext.jsx';
import { HomePage } from './pages/public/HomePage.jsx';
import { SearchPage } from './pages/public/SearchPage.jsx';
import { VehicleDetailPage } from './pages/public/VehicleDetailPage.jsx';
import { SellerRegistration } from './pages/public/SellerRegistrationPage.jsx';
import { AboutPage } from './pages/public/AboutPage.jsx';
import { PricingPage } from './pages/public/PricingPage.jsx';
import { InspectionsInfoPage } from './pages/public/inspections.jsx';
import { FaqPage } from './pages/public/FaqPage.jsx';
import { TermsPage } from './pages/public/TermsPage.jsx';
import { ScrollToTop } from './components/layout/ScrollToTop.jsx';
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
import { InspectionsPage } from './components/admin/InspectionsPage.jsx';
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
import { dashboardPathFor, normalizeRole } from './utils/roleAccess.js';

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

const RoleHome = () => {
  const { user } = useAuthGate();
  return <Navigate to={dashboardPathFor(user?.role || user?.userRole)} replace />;
};

// Login roles: admin, seller (individual), dealer (shop), buyer, inspector (Field Inspector).
// Not signed in -> /login (then back here). Wrong role -> that user's own dashboard.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthGate();
  const location = useLocation();
  const userRole = normalizeRole(user?.role || user?.userRole);
  const allowed = (allowedRoles || []).map(normalizeRole);

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (allowedRoles && !allowed.includes(userRole)) return <Navigate to={dashboardPathFor(userRole)} replace />;
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
        <Route path="/pricing" element={<PricingPage />} />
        {/* "How inspections work" (footer link) */}
        <Route path="/inspection" element={<InspectionsInfoPage />} />
        <Route path="/inspections" element={<InspectionsInfoPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
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

// Shared by the Seller (/seller/*, individual — one vehicle) and Dealer (/dealer/*, shop — many
// vehicles) roles. Same pages; the server scopes every record to the signed-in account and
// enforces the Seller's one-listing limit.
const SellerDashboardShell = ({ base = '/seller' }) => (
  <SellerDashboardLayout>
    <Routes>
      <Route path="" element={<Navigate to={`${base}/dashboard`} replace />} />
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
      <Route path="dashboard/orders" element={<AdminPaymentsPage />} />
      <Route path="dashboard/inspections" element={<InspectionsPage />} />
      <Route path="dashboard/payments" element={<Navigate to="/admin/dashboard/orders" replace />} />
      {/* <Route path="dashboard/messages" element={<AdminMessagesPage />} /> */}
      <Route path="dashboard/messages" element={<MessagesPage />} />
      <Route path="dashboard/notifications" element={<NotificationsPage />} />
      <Route path="dashboard/settings" element={<AdminSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AdminDashboardLayout>
);

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              {/* every page opens at the top */}
              <ScrollToTop />
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
                  <Route path="/seller/*" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboardShell base="/seller" /></ProtectedRoute>} />
                  <Route path="/dealer/*" element={<ProtectedRoute allowedRoles={['dealer']}><SellerDashboardShell base="/dealer" /></ProtectedRoute>} />
                  <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardShell /></ProtectedRoute>} />

                  {/* Field Inspector — server role INSPECTOR ("inspector" in the session).
                      This used to allow only "field_inspector", so inspectors were bounced to the home page. */}
                  <Route
                    path="/field-inspector"
                    element={
                      <ProtectedRoute allowedRoles={['inspector']}>
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

                  {/* /dashboard -> the signed-in user's own dashboard */}
                  <Route path="/dashboard/*" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />
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