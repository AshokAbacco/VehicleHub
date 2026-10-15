// VehicleHub/VehicleHub_Server/src/data/roles.js
// The app has five login roles (Prisma enum Role).
module.exports = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER', // individual — one vehicle at a time
  DEALER: 'DEALER', // business / shop — many vehicles
  BUYER: 'BUYER',
  INSPECTOR: 'INSPECTOR', // Field Inspector
};