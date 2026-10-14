const roles = require('./roles');

module.exports = {
  [roles.SUPER_ADMIN]: ['*'],
  [roles.ADMIN]: ['manage:users', 'manage:vehicles', 'manage:brands', 'manage:categories', 'manage:reports', 'manage:payments'],
  [roles.SELLER]: ['create:vehicle', 'update:vehicle', 'delete:vehicle', 'view:inquiries'],
  [roles.BUYER]: ['view:vehicles', 'create:inquiry', 'view:wishlist', 'make:payment'],
  [roles.DEALER]: ['manage:inventory', 'view:leads'],
  [roles.INSPECTOR]: ['inspect:vehicles', 'update:inspection'],
  [roles.FINANCE]: ['manage:loans', 'view:payments'],
  [roles.SUPPORT]: ['manage:tickets', 'view:notifications'],
};
