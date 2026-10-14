import dashboardService from '../services/dashboardService.js';
import { sendSuccess  } from '../utils/response.js';

export const adminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    sendSuccess(res, 'Admin dashboard data fetched', data);
  } catch (error) {
    next(error);
  }
};

export const sellerDashboard = async (req, res) => sendSuccess(res, 'Seller dashboard data fetched');
export const buyerDashboard = async (req, res) => sendSuccess(res, 'Buyer dashboard data fetched');
export const dealerDashboard = async (req, res) => sendSuccess(res, 'Dealer dashboard data fetched');
export const inspectorDashboard = async (req, res) => sendSuccess(res, 'Inspector dashboard data fetched');
export const financeDashboard = async (req, res) => sendSuccess(res, 'Finance dashboard data fetched');
export const superAdminDashboard = async (req, res) => sendSuccess(res, 'Super admin dashboard data fetched');
