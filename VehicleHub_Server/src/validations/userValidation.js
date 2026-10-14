import Joi from "joi";

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  username: Joi.string().optional(),
  avatar: Joi.string().optional(),
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
