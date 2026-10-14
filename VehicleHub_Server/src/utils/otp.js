import crypto from "crypto";
import bcrypt from "bcryptjs";

export const generateOTP = () => {
  const length = Number(process.env.OTP_LENGTH || 6);

  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(crypto.randomInt(min, max + 1));
};

export const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

export const compareOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};
