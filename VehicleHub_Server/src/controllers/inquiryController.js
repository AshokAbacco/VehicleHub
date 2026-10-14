import inquiryModel from '../models/inquiryModel.js';
import { sendSuccess, sendError  } from '../utils/response.js';
import { validate  } from '../middleware/validationMiddleware.js';
import { inquirySchema  } from '../validations/inquiryValidation.js';

export const createInquiry = [
  validate(inquirySchema),
  async (req, res, next) => {
    try {
      const inquiry = await inquiryModel.create({ ...req.body, buyerId: req.user?.id || req.body.buyerId });
      sendSuccess(res, 'Inquiry created successfully', inquiry, 201);
    } catch (error) {
      next(error);
    }
  },
];

export const getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await inquiryModel.findByUser(req.user.id);
    sendSuccess(res, 'Inquiries fetched successfully', inquiries);
  } catch (error) {
    next(error);
  }
};

export const acceptInquiry = async (req, res) => sendSuccess(res, 'Inquiry accepted');
export const rejectInquiry = async (req, res) => sendSuccess(res, 'Inquiry rejected');
export const closeInquiry = async (req, res) => sendSuccess(res, 'Inquiry closed');
