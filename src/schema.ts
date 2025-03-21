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
    ref: "Category",
  },
});

const ReviewSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
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
    ref: "Category",
    required: true,
  },
  availability: {
    type: String,
    enum: ["in_stock", "stock_out", "upcoming"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount_price: {
    type: Number,
  },
  description: {
    type: String,
  },
  details: {
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
  image_urls: {
    type: [String],
  },
});

const FavoriteSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

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

const OrderSchema = new Schema({
  order_type: {
    type: String,
    required: true,
    enum: ["custom", "repair", "ready-made"],
  },
  custom_order_details: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    jewelry_type: {
      type: String,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
    },
  },
  ready_made_details: {
    shipping_address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    products: {
      type: [Types.ObjectId],
      ref: "Product",
    },
  },
});

const AppointmentSchema = new Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
});

const User = model("User", UserSchema);
const OTP = model("OTP", OTPSchema);
const Favorite = model("Favorite", FavoriteSchema);
const Category = model("Category", CategorySchema);
const Review = model("Review", ReviewSchema);
const Product = model("Product", ProductSchema);
const Info = model("Info", InfoSchema);
const Order = model("Order", OrderSchema);
const Appointment = model("Appointment", AppointmentSchema);

export {
  User,
  OTP,
  Favorite,
  Category,
  Review,
  Product,
  Info,
  Order,
  Appointment,
};
