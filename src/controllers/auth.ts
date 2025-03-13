import { sendOTP, verifyOTP } from "@services/otpService";
import { generatePasswordResetToken } from "@utils/jwt";
import { plainPasswordToHash } from "@utils/password";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { User } from "src/schema";

const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req?.body || {};

  const error = validateRequiredFields({ name, email, password });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const user_exists = await User.findOne({ email });

  if (user_exists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const password_hash = await plainPasswordToHash(password);

  await User.create({ name, email, password_hash });

  await sendOTP(email, "signup");

  res.json({ message: "OTP sent to email" });
};
const verify_otp = async (req: Request, res: Response) => {
  const { email, otp } = req?.body || {};

  const error = validateRequiredFields({ email, otp });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const otpDoc = await verifyOTP(email, otp);
    if (otpDoc.type === "signup") {
      await User.updateOne({ email }, { $set: { emailVerified: true } });
      res.status(200).json({ message: "Email verified successfully" });
      return;
    }
    if (otpDoc.type === "forgot_password") {
      const passwordResetToken = generatePasswordResetToken(email);
      res.status(200).json({
        message: "Password reset token generated",
        passwordResetToken,
      });
      return;
    }
    res.status(400).json({ message: "Invalid OTP" });
    return;
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
    return;
  }
};
const login = async (req: Request, res: Response) => {
  res.json({ message: "Login" });
};
const forgot_password = async (req: Request, res: Response) => {
  res.json({ message: "Login" });
};
const reset_password = async (req: Request, res: Response) => {
  res.json({ message: "Login" });
};
const refresh_token = async (req: Request, res: Response) => {
  res.json({ message: "Login" });
};

export {
  signup,
  verify_otp,
  login,
  forgot_password,
  reset_password,
  refresh_token,
};
