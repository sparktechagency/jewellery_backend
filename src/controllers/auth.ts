import { triggerNotification } from "@services/notificationService";
import { sendOTP, verifyOTP } from "@services/otpService";
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
  verifyPasswordResetToken,
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

  const user = await User.create({ name, email, password_hash });


  await sendOTP(user.name, email, "signup");

  triggerNotification("SIGNUP", { email });
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
        message: "Email verified successfully",
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

  const user = await User.findOne({ email, emailVerified: true});

  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  if( user.account_status === "Banned"){
    res.status(403).json({ message: "Your account has been banned. Please contact support." }
    );
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
    .json({
      message: "Login successful",
      accessToken,
      refreshToken,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
};

const forgot_password = async (req: Request, res: Response) => {
  const { email } = req?.body || {};

  const error = validateRequiredFields({ email });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  await sendOTP(user.name, email, "forgot_password");

  res.status(200).json({ message: "OTP sent to email" });
};
const reset_password = async (req: Request, res: Response) => {
  const { email, password, token } = req?.body || {};

  const error = validateRequiredFields({ email, password, token });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    verifyPasswordResetToken(token);
    const password_hash = await plainPasswordToHash(password);
    await User.updateOne({ email }, { $set: { password_hash } });
    res.status(200).json({ message: "Password reset successfully" });
    return;
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
    return;
  }
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
const resend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email: emailFromBody, type } = req.body || {};

    // normalize email
    const email = emailFromBody.trim().toLowerCase();

    const existingUser = await User.findOne({ email }).exec();
    if (!existingUser) {
      res.status(400).json({
        message: `User with the email ${email} doesn't exist.`,
      });
      return;
    }

    await sendOTP(existingUser.name, email, type);

    const response: { success: boolean; message: string; otp?: string } = {
      success: true,
      message: "OTP sent successfully",
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export {
  signup,
  verify_otp,
  login,
  forgot_password,
  reset_password,
  refresh_token,
  resend,
};
