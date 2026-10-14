import inspectionModel from '../models/inspectionModel.js';
import { sendSuccess  } from '../utils/response.js';

export const createInspection = async (req, res, next) => {
  try {
    const inspection = await inspectionModel.create({ ...req.body, inspectorId: req.user?.id });
    sendSuccess(res, 'Inspection created successfully', inspection, 201);
  } catch (error) {
    next(error);
  }
};

export const assignInspector = async (req, res) => sendSuccess(res, 'Inspector assigned');
export const updateReport = async (req, res) => sendSuccess(res, 'Inspection report updated');
export const approveInspection = async (req, res) => sendSuccess(res, 'Inspection approved');
export const rejectInspection = async (req, res) => sendSuccess(res, 'Inspection rejected');
