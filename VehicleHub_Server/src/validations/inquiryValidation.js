import Joi from "joi";

export const inquirySchema = Joi.object({
  vehicleId: Joi.string().required(),
  message: Joi.string().required(),
});
