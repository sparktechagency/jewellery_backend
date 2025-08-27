import { version } from "os";
import { model, Schema, Types } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    photo_url: { type: String },
    password_hash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
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
    account_status: {
      type: String,
      required: true,
      default: "Active",
      enum: ["Active", "Banned"],
    },
  },
  { timestamps: true, versionKey: false }
);

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

const CategorySchema = new Schema(
  {
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
  },
  { timestamps: true, versionKey: false }
);

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
  { timestamps: true, versionKey: false }
);

const ProductSchema = new Schema(
  {
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
    ratings: {
      type: [Number],
    },
    image_urls: {
      type: [String],
    },
  },
  { timestamps: true, versionKey: false }
);

const FavoriteSchema = new Schema(
  {
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
  },
  { timestamps: true, versionKey: false }
);

const InfoSchema = new Schema(
  {
    page: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const OrderSchema = new Schema(
  {
    order_type: {
      type: String,
      required: true,
      enum: ["custom", "repair", "ready-made"],
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
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
      products: [
        {
          product_id: {
            type: Types.ObjectId,
            ref: "Product",
          },
          color: {
            type: String,
          },
          size: {
            type: String,
          },
          quantity: {
            type: Number,
          },
        },
      ],
    },
    payment_status: {
      type: String,
      default: "Pending",
    },
    payment_id: {
      type: String,
    },
    order_status: {
      type: String,
      default: "Pending",
    },
    custom_order_price: {
      type: Number,
    },
  },
  { timestamps: true, versionKey: false }
);

const AppointmentSchema = new Schema(
  {
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
  },
  { timestamps: true, versionKey: false }
);

const ContactSchema = new Schema(
  {
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
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const FAQSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const NotificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const ContactDetailSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", UserSchema);
const OTP = model("OTP", OTPSchema);
const Favorite = model("Favorite", FavoriteSchema);
const Category = model("Category", CategorySchema);
const Review = model("Review", ReviewSchema);
const Product = model("Product", ProductSchema);
const Info = model("Info", InfoSchema);
const Order = model("Order", OrderSchema);
const Appointment = model("Appointment", AppointmentSchema);
const Contact = model("Contact", ContactSchema);
const FAQ = model("FAQ", FAQSchema);
const Notification = model("Notification", NotificationSchema);
const ManageContact = model("Manage-Contact", ContactDetailSchema);

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
  Contact,
  FAQ,
  Notification,
  ManageContact,
};
