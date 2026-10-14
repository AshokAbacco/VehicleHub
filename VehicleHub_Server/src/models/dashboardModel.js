const { prisma } = require('../config/db');

class DashboardModel {
  async getCounts() {
    return Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.payment.count(),
      prisma.inquiry.count(),
    ]);
  }
}

module.exports = new DashboardModel();
