import paymentService from '../services/paymentService.js';
import { sendSuccess  } from '../utils/response.js';
import { validate  } from '../middleware/validationMiddleware.js';
import { paymentSchema  } from '../validations/paymentValidation.js';

export const createPayment = [
  validate(paymentSchema),
  async (req, res, next) => {
    try {
      const payment = await paymentService.createPayment({ ...req.body, userId: req.user?.id || req.body.userId });
      sendSuccess(res, 'Payment initiated', payment, 201);
    } catch (error) {
      next(error);
    }
  },
];

export const paymentSuccess = async (req, res) => sendSuccess(res, 'Payment success');
export const paymentFailed = async (req, res) => sendSuccess(res, 'Payment failed');
export const refund = async (req, res) => sendSuccess(res, 'Refund processed');
export const transactionHistory = async (req, res, next) => {
  try {
    const history = await paymentService.getPaymentsByUser(req.user.id);
    sendSuccess(res, 'Transaction history fetched', history);
  } catch (error) {
    next(error);
  }
};
