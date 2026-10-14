import { prisma  } from '../config/db.js';
import { sendSuccess  } from '../utils/response.js';

export const salesReport = async (req, res, next) => {
  try {
    const sales = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
    sendSuccess(res, 'Sales report fetched', sales);
  } catch (error) {
    next(error);
  }
};

export const revenueReport = async (req, res, next) => {
  try {
    const revenue = await prisma.payment.aggregate({ _sum: { amount: true } });
    sendSuccess(res, 'Revenue report fetched', revenue);
  } catch (error) {
    next(error);
  }
};

export const vehicleReport = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    sendSuccess(res, 'Vehicle report fetched', vehicles);
  } catch (error) {
    next(error);
  }
};

export const userReport = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    sendSuccess(res, 'User report fetched', users);
  } catch (error) {
    next(error);
  }
};

export const inspectionReport = async (req, res, next) => {
  try {
    const inspections = await prisma.inspection.findMany();
    sendSuccess(res, 'Inspection report fetched', inspections);
  } catch (error) {
    next(error);
  }
};
