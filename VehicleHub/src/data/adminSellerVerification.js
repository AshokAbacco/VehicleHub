// Shared in-memory store: SellerRegistration.jsx writes here, admin's SellersPage reads/reviews here.
// Swap this for a real API call (POST /api/sellers/register, GET /api/admin/pending-sellers) when the backend exists.

export let pendingSellerRegistrations = [];

export const addPendingSellerRegistration = (registration) => {
  pendingSellerRegistrations = [
    {
      id: `pending-seller-${Date.now()}`,
      submittedAt: "Just now",
      status: "Pending Verification",
      ...registration,
    },
    ...pendingSellerRegistrations,
  ];
};

export const removePendingSellerRegistration = (id) => {
  pendingSellerRegistrations = pendingSellerRegistrations.filter(
    (s) => s.id !== id,
  );
};
