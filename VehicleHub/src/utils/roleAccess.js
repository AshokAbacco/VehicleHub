// VehicleHub/VehicleHub/src/utils/roleAccess.js
// The app has five login roles: Admin, Seller (individual — one vehicle), Dealer (shop — many
// vehicles), Buyer, Field Inspector. Server role values: ADMIN, SELLER, DEALER, BUYER, INSPECTOR
// (stored lowercase in the session).

export const normalizeRole = (role) => {
  const r = String(role || 'buyer').toLowerCase().replace(/-/g, '_');
  // "field_inspector" (older sessions) and "inspector" are the same role
  return r === 'field_inspector' ? 'inspector' : r;
};

export const roleLabels = {
  admin: 'Admin',
  seller: 'Seller',
  dealer: 'Dealer',
  buyer: 'Buyer',
  inspector: 'Field Inspector',
};

export const roleRoutes = {
  admin: '/admin/dashboard',
  seller: '/seller/dashboard',
  dealer: '/dealer/dashboard',
  buyer: '/buyer/dashboard',
  inspector: '/field-inspector/dashboard',
};

export const roleNotificationRoutes = {
  admin: '/admin/dashboard/notifications',
  seller: '/seller/dashboard/notifications',
  dealer: '/dealer/dashboard/notifications',
  buyer: '/buyer/dashboard/notifications',
  inspector: '/field-inspector/notifications',
};

export const dashboardPathFor = (role) => roleRoutes[normalizeRole(role)] || '/buyer/dashboard';
export const notificationsPathFor = (role) => roleNotificationRoutes[normalizeRole(role)] || '/buyer/dashboard/notifications';

export const hasAccess = (userRole, allowedRoles) =>
  allowedRoles.map((role) => normalizeRole(role)).includes(normalizeRole(userRole));