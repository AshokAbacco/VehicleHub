import { prisma } from "../config/db.js";

class DashboardService {
  async getAdminDashboard() {
    const [users, vehicles, payments, inquiries] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.payment.count(),
      prisma.inquiry.count(),
    ]);

    return { users, vehicles, payments, inquiries };
  }
}

export default new DashboardService();
