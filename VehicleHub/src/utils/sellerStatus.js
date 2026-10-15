// VehicleHub/VehicleHub/src/utils/sellerStatus.js
// Seller application status, shared by the "SELL" buttons, the auth popup and the seller area.
//
// A user applies on /seller-Register and stays a BUYER while the admin reviews it.
// Only after the admin approves does the account become a SELLER (individual application)
// or DEALER (dealer application) and that dashboard open. GET /api/sellers/me/status returns:
//   { role, isSellerRegistered, status: null|PENDING|APPROVED|REJECTED|SUSPENDED, isApproved, rejectReason }

const apiBase = () => {
    const raw = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
};

export const fetchSellerStatus = async () => {
    const token = localStorage.getItem('vehiclehub_token');
    if (!token) return null;
    try {
        const res = await fetch(`${apiBase()}/sellers/me/status`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Seller status check failed', error);
        return null;
    }
};

/**
 * Sends the user to the right place for selling:
 *   approved seller -> /seller/dashboard, approved dealer -> /dealer/dashboard
 *   (session role updated if the admin's decision changed it)
 *   anyone else     -> /seller-Register (shows the form, or "under review" / "rejected")
 */
export const openSellerArea = async ({ navigate, user, completeAuth }) => {
    const status = await fetchSellerStatus();
    const serverRole = String(status?.role || '').toLowerCase();
    const localRole = String(user?.role || '').toLowerCase();
    if (status && serverRole && serverRole !== localRole && user && completeAuth) {
        // Admin approved / rejected since this session started — keep the session in sync
        completeAuth({ ...user, role: serverRole, userRole: serverRole }, localStorage.getItem('vehiclehub_token'));
    }
    if (status?.isApproved) {
        navigate(serverRole === 'dealer' ? '/dealer/dashboard' : '/seller/dashboard');
        return status;
    }
    navigate('/seller-Register');
    return status;
};