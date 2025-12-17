import { config } from "dotenv";
import Stripe from "stripe";

config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Stripe secret key is not defined in environment variables");
}

export const createCheckoutSession = async ({
  order_data,
  line_items,
}: {
  order_data: any;
  line_items: any;
}) => {
  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: "payment",
      success_url: process.env.PAYMENT_SUCCESS_URL || "http://13.60.228.122:5000/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.PAYMENT_CANCEL_URL || "http://13.60.228.122:5000/payment/cancel",
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Session expires in 30 minutes
      metadata: {
        order_data: JSON.stringify(order_data), // Store order data in session metadata
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Adjust as needed
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};