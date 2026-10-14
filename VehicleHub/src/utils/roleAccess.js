export const roleLabels = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  dealer: 'Dealer',
  seller: 'Seller',
  buyer: 'Buyer',
  inspector: 'Inspector',
  'field_inspector': 'Field Inspector',
  'field-inspector': 'Field Inspector',
  finance: 'Finance Executive',
  support: 'Support Executive',
};

export const roleRoutes = {
  'super-admin': '/super-admin/dashboard',
  admin: '/admin/dashboard',
  dealer: '/dealer/dashboard',
  seller: '/seller/dashboard',
  buyer: '/buyer/dashboard',
  inspector: '/field-inspector/dashboard',
  'field_inspector': '/field-inspector/dashboard',
  'field-inspector': '/field-inspector/dashboard',
  finance: '/finance/dashboard',
  support: '/support/dashboard',
};

export const hasAccess = (userRole, allowedRoles) => allowedRoles.map((role) => String(role).toLowerCase()).includes(String(userRole || '').toLowerCase());
