// VehicleHub/VehicleHub/src/components/admin/adminNotificationLinks.js
// Where an admin notification leads when clicked (based on the metadata the server stores).
export const adminNotificationTarget = (n) => {
    const meta = n?.metadata || {};
    if (meta.kind === 'seller_registration' || meta.sellerUserId) return { sellerId: meta.sellerUserId || meta.sellerProfileId };
    if (meta.inspectionId) return { to: '/admin/dashboard/inspections' };
    if (meta.kind === 'vehicle_submitted') return { to: '/admin/dashboard/vehicle-approvals' };
    if (meta.conversationId) return { to: '/admin/dashboard/messages' };
    if (meta.vehicleId) return { to: '/admin/dashboard/all-vehicles' };
    return {};
};