import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  role: Joi.string()
    .valid(
      "SUPER_ADMIN",
      "ADMIN",
      "SELLER",
      "BUYER",
      "DEALER",
      "INSPECTOR",
      "FINANCE",
      "SUPPORT",
    )
    .optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
