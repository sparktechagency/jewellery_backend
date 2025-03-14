import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["user", "admin"],
  },
  shipping_address: {
    street_address: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
  },
});

const OTPSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["signup", "login", "forgot_password"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // 5 minutes
  },
});

const User = model("User", UserSchema);
const OTP = model("OTP", OTPSchema);

export { User, OTP };
