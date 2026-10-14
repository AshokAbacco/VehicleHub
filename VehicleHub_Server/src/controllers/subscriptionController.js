import subscriptionModel from '../models/subscriptionModel.js';
import { sendSuccess  } from '../utils/response.js';

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionModel.create({ ...req.body, userId: req.user?.id || req.body.userId });
    sendSuccess(res, 'Subscription created', subscription, 201);
  } catch (error) {
    next(error);
  }
};

export const upgradePlan = async (req, res) => sendSuccess(res, 'Plan upgraded');
export const cancelPlan = async (req, res) => sendSuccess(res, 'Plan canceled');
export const paymentHistory = async (req, res) => sendSuccess(res, 'Subscription payment history fetched');
