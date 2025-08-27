import { OTP } from "src/schema";
import emailSender from "./emailService";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (
  name: string,
  email: string,
  type: "signup" | "login" | "forgot_password"
) => {
  const otp = generateOtp();
  await OTP.create({ otp: `${email}:${otp}`, type });

  
   await emailSender(
    'Verify Your Email',
    email,

    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #f2f3eaff; padding: 20px; text-align: center; color: #000000; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>

      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${
          name
        }</strong>,</p>
        <p style="font-size: 16px;">Please verify your email.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px;" >Verify email using this OTP: <span style="font-weight:bold"> ${otp} </span><br/> This OTP will be Expired in 5 minutes,</p>
        </div>
        <p style="font-size: 14px; color: #555;">If you did not request this change, please ignore this email. No further action is needed.</p>
        <p style="font-size: 16px; margin-top: 20px;">Thank you,<br>Jewelery</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Jewelery Team. All rights reserved.</p>
      </td>
    </tr>
    </table>
  </div>

      `,
  );
  return otp;
};

const verifyOTP = async (email: string, otp: string) => {
  const otpDoc = await OTP.findOne({ otp: `${email}:${otp}` });
  if (!otpDoc) {
    throw new Error("Invalid OTP");
  }
  await OTP.deleteOne({ _id: otpDoc._id });
  return otpDoc;
};

export { sendOTP, verifyOTP };
