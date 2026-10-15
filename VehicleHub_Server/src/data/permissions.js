// VehicleHub/VehicleHub_Server/src/data/permissions.js
const roles = require('./roles');

module.exports = {
  [roles.ADMIN]: ['*'],
  [roles.SELLER]: ['create:vehicle', 'update:vehicle', 'delete:vehicle', 'view:inquiries'], // own vehicles, one open listing
  [roles.DEALER]: ['create:vehicle', 'update:vehicle', 'delete:vehicle', 'view:inquiries'], // own shop's vehicles, no limit
  [roles.BUYER]: ['view:vehicles', 'create:inquiry', 'view:wishlist', 'make:payment'],
  [roles.INSPECTOR]: ['inspect:vehicles', 'update:inspection'],
};