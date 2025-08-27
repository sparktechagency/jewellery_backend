import { config } from "dotenv";
import Stripe from "stripe";

config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Stripe secret key is not defined in environment variables");
}
export const createCheckoutSession = async ({
  userId,
  line_items,
}: {
  userId: string;
  line_items: any;
}) => {
  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      line_items,
      //   line_items: [
      //     {
      //       price_data: {
      //         currency: "usd",
      //         product_data: {
      //           name: "Avantra",
      //         },
      //         unit_amount: 1000,
      //         recurring: {
      //           interval: "month",
      //         },
      //       },
      //       quantity: 1,
      //     },
      //   ],
      mode: "payment",
      success_url: process.env.PAYMENT_SUCCESS_URL || "http://localhost:3000/success.html",
      cancel_url: process.env.PAYMENT_CANCEL_URL || "http://localhost:3000/cancel.html",
    });

    return session;
  } catch (error) {
    return error;
  }
};
