import financeModel from '../models/financeModel.js';
import { sendSuccess  } from '../utils/response.js';

export const applyLoan = async (req, res, next) => {
  try {
    const loan = await financeModel.createLoan({ ...req.body, userId: req.user.id });
    sendSuccess(res, 'Loan application submitted', loan, 201);
  } catch (error) {
    next(error);
  }
};

export const approveLoan = async (req, res) => sendSuccess(res, 'Loan approved');
export const rejectLoan = async (req, res) => sendSuccess(res, 'Loan rejected');
export const loanDetails = async (req, res) => sendSuccess(res, 'Loan details fetched');
export const loanEMI = async (req, res) => sendSuccess(res, 'EMI details fetched');
