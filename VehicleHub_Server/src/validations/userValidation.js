// VehicleHub/VehicleHub_Server/src/validations/userValidation.js
import Joi from "joi";

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  username: Joi.string().optional(),
  avatar: Joi.string().optional(),
  role: Joi.string()
    .valid(
      "ADMIN",
      "SELLER",
      "DEALER",
      "BUYER",
      "INSPECTOR",
    )
    .optional(),
});