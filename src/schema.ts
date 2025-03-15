import { model, Schema, Types } from "mongoose";

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

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  img_url: {
    type: String,
    required: true,
  },
  subcategory_of: {
    type: Types.ObjectId,
    ref: "category",
  },
});

const ReviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: Types.ObjectId,
    ref: "category",
  },
  discount_percentage: {
    type: Number,
  },
  in_stock: {
    type: Boolean,
  },
  price: {
    type: Number,
  },
  small_description: {
    type: String,
  },
  big_description: {
    type: String,
  },
  colors: {
    type: [String],
  },
  sizes: {
    type: [String],
  },
  reviews: {
    type: [Types.ObjectId],
    ref: "Review",
  },
});

const FavoriteSchema = new Schema({});

const InfoSchema = new Schema({
  page: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const User = model("User", UserSchema);
const OTP = model("OTP", OTPSchema);
const Favorite = model("Favorite", FavoriteSchema);
const Category = model("Category", CategorySchema);
const Review = model("Review", ReviewSchema);
const Product = model("Product", ProductSchema);
const Info = model("Info", InfoSchema);

export { User, OTP, Favorite, Category, Review, Product, Info };
