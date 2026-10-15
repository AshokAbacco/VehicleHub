// VehicleHub/VehicleHub/src/hooks/useSellerArea.js
// The seller dashboard is shared by two login roles:
//   Seller -> /seller/dashboard/...  (individual, one vehicle at a time)
//   Dealer -> /dealer/dashboard/...  (shop / business, many vehicles)
// Use `to('add-vehicle')` instead of hardcoding "/seller/dashboard/add-vehicle".
import { useAuth } from '../context/AuthContext.jsx';
import { normalizeRole } from '../utils/roleAccess.js';

export const sellerAreaBase = (role) => (normalizeRole(role) === 'dealer' ? '/dealer/dashboard' : '/seller/dashboard');

export const useSellerArea = () => {
    const { user } = useAuth();
    const role = normalizeRole(user?.role);
    const isDealer = role === 'dealer';
    const base = sellerAreaBase(role);
    return {
        role,
        isDealer,
        base,
        label: isDealer ? 'Dealer' : 'Seller',
        to: (path = '') => (path ? `${base}/${String(path).replace(/^\//, '')}` : base),
    };
};