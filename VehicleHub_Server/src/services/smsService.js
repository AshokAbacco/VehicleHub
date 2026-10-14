import axios from "axios";

export const sendOtpSMS = async (mobile) => {
  const response = await axios.post(
    "https://cpaas.messagecentral.com/verification/v3/send",
    {
      countryCode: "91",
      customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
      flowType: "SMS",
      mobileNumber: mobile,
    },
    {
      headers: {
        authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};


export const verifyOtpSMS = async (verificationId, code) => {
  const response = await axios.post(
    "https://cpaas.messagecentral.com/verification/v3/validateOtp",
    {
      verificationId,
      code,
    },
    {
      headers: {
        authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};