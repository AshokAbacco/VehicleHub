import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOTPEmail = async ({ email, otp }) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "VehicleHub - Your Verification OTP",

    html: `
            <div style="
                font-family: Arial, sans-serif;
                background:#f5f7fb;
                padding:40px 20px;
            ">
                <div style="
                    max-width:500px;
                    margin:auto;
                    background:#ffffff;
                    border-radius:16px;
                    padding:32px;
                    box-shadow:0 5px 25px rgba(0,0,0,0.08);
                ">

                    <h2 style="
                        margin:0 0 10px;
                        color:#001f3f;
                    ">
                        VehicleHub
                    </h2>

                    <p style="color:#555;">
                        Your verification OTP is:
                    </p>

                    <div style="
                        margin:25px 0;
                        padding:18px;
                        background:#f1f5f9;
                        border-radius:12px;
                        text-align:center;
                        font-size:32px;
                        font-weight:bold;
                        letter-spacing:8px;
                        color:#001f3f;
                    ">
                        ${otp}
                    </div>

                    <p style="color:#666;">
                        This OTP will expire in
                        <strong>${process.env.OTP_EXPIRES_MINUTES || 5} minutes</strong>.
                    </p>

                    <p style="
                        font-size:13px;
                        color:#999;
                        margin-top:25px;
                    ">
                        If you did not request this OTP, please ignore this email.
                    </p>

                </div>
            </div>
        `,
  });
};
