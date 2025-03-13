import { sendOTP, verifyOTP } from "@services/otpService";
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@utils/jwt";
import { comparePassword, plainPasswordToHash } from "@utils/password";
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
  const { email, password, remember_me } = req?.body || {};

  const error = validateRequiredFields({ email, password });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  const isPasswordCorrect = await comparePassword(password, user.password_hash);
  if (!isPasswordCorrect) {
    res.status(400).json({ message: "Invalid password" });
    return;
  }

  const accessToken = generateAccessToken(
    user._id.toString(),
    user.email,
    user.role
  );
  const refreshToken = generateRefreshToken(user.email, user.role, remember_me);

  res
    .status(200)
    .json({ message: "Login successful", accessToken, refreshToken });
};
const forgot_password = async (req: Request, res: Response) => {
  res.json({ message: "Login" });
};
const reset_password = async (req: Request, res: Response) => {
  res.json({ message: "Login" });
};
const refresh_token = async (req: Request, res: Response) => {
  const refreshToken = req.headers.authorization?.split(" ")[1];

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token not found" });
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    res.status(200).json({
      message: "Token refreshed",
      accessToken,
    });
    return;
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
    return;
  }
};

export {
  signup,
  verify_otp,
  login,
  forgot_password,
  reset_password,
  refresh_token,
};
