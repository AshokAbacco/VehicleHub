import Joi from "joi";

export const paymentSchema = Joi.object({
  amount: Joi.number().required(),
  currency: Joi.string().optional(),
  provider: Joi.string().optional(),
  reference: Joi.string().optional(),
  vehicleId: Joi.string().optional(),
});
