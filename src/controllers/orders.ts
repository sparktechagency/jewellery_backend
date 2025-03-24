import { AuthenticatedRequest } from "@middleware/auth";
import { createCheckoutSession } from "@services/stripeService";
import uploadService from "@services/uploadService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { Order, Product } from "src/schema";
import Stripe from "stripe";

const custom_or_repair_order = async (req: Request, res: Response) => {
  const { type, name, email, phone, address, jewelry_type, description } =
    req.body || {};
  const image = req.file;

  const error = validateRequiredFields({
    type,
    name,
    email,
    phone,
    address,
    jewelry_type,
    description,
    image,
  });

  if (error) {
    res.json({ message: error });
    return;
  }

  const image_url = await uploadService(image, "image");

  try {
    await Order.create({
      order_type: type,
      custom_order_details: {
        name,
        email,
        phone,
        address,
        jewelry_type,
        description,
        image_url,
      },
    });
    res.json({ message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const place_order = async (req: any, res: Response) => {
  const { shipping_address, city, state, zip, products } = req.body || {};

  const error = validateRequiredFields({
    shipping_address,
    city,
    state,
    zip,
    products,
  });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  if (!Array.isArray(products) || products.length === 0) {
    res
      .status(400)
      .json({ message: "Products array is required and cannot be empty" });
    return;
  }

  for (const product of products) {
    if (!isObjectIdOrHexString(product.id)) {
      res.status(400).json({ message: `Invalid product ID: ${product}` });
      return;
    }
  }

  const productsFromDB = await Product.find({
    _id: { $in: products.map((product) => product.id) },
  });

  if (productsFromDB.length !== products.length) {
    res.status(400).json({ message: "One or more product IDs are invalid" });
    return;
  }

  try {
    const order = await Order.create({
      order_type: "ready-made",
      user: req?.user?.id,
      ready_made_details: {
        shipping_address,
        city,
        state,
        zip,
        products: products.map((p) => ({ product_id: p.id, ...p })),
      },
    });

    const line_items = productsFromDB.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
        },
        unit_amount:
          (product.discount_price ? product.discount_price : product.price) *
          100,
      },
      quantity: products.find((p) => p.id === product.id).quantity,
    }));

    const stripe: any = await createCheckoutSession({
      userId: order._id.toString(),
      line_items,
    });

    res.json({ message: "Order created successfully", stripe_url: stripe.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_orders = async (req: Request, res: Response) => {
  const { type, page = 1, limit = 10 } = req.query;

  const error = validateRequiredFields({ type });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const filters =
      type === "ready-made"
        ? { order_type: "ready-made" }
        : { order_type: { $ne: "ready-made" } };

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const totalContacts = await Order.countDocuments(filters);
    const totalPages = Math.ceil(totalContacts / pageSize);

    const orders = await Order.find(filters, {
      custom_order_details: 0,
      ready_made_details: 0,
      __v: 0,
    })
      .populate({
        path: "ready_made_details.products.product_id",
        model: "Product",
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagination = {
      totalContacts,
      totalPages,
      currentPage: pageNumber,
      pageSize,
    };
    res.json({ orders, pagination });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const edit_order = async (req: Request, res: Response) => {
  const { order_id, order_status, payment_status, price } = req.body || {};

  const error = validateRequiredFields({
    order_id,
  });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const order = await Order.findById(order_id);

  if (!order) {
    res.status(400).json({ message: "Invalid order_id" });
    return;
  }

  if (order.order_type === "ready-made" && price) {
    res
      .status(400)
      .json({ message: "Can't update price for this type of orders" });
    return;
  }

  if (
    order_status &&
    !["Pending", "In Progress", "Shipped", "Completed", "Canceled"].includes(
      order_status
    )
  ) {
    res.status(400).json({ message: "Invalid order_status" });
    return;
  }

  if (
    payment_status &&
    !["Pending", "Paid", "Canceled"].includes(payment_status)
  ) {
    res.status(400).json({ message: "Invalid payment_status" });
    return;
  }

  try {
    await order.updateOne({
      ...(order_status && { order_status }),
      ...(payment_status && { payment_status }),
      ...(price && { custom_order_price: price }),
    });
    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const stripe_webhook = async (req: Request, res: Response): Promise<void> => {
  const webhook_secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(500).send("Missing Stripe signature");
    return;
  }
  if (!webhook_secret) {
    res.status(500).send("Missing Stripe webhook secret");
    return;
  }
  try {
    const event = Stripe.webhooks.constructEvent(req.body, sig, webhook_secret);
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      await Order.findByIdAndUpdate(session.client_reference_id, {
        payment_id: session.id,
        payment_status: "Paid",
      });

      res.send();
    } else {
      console.log(`Unhandled event type ${event.type}`);
      res.send();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(`Webhook Error: ${err}`);
    return;
  }
};

const get_user_orders = async (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.query;
  try {
    const filters =
      type === "custom"
        ? { order_type: { $ne: "ready-made" } }
        : { order_type: "ready-made" };

    const orders = await Order.find({
      user: req.user?.id,
      ...filters,
    });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

export {
  custom_or_repair_order,
  place_order,
  get_orders,
  edit_order,
  stripe_webhook,
  get_user_orders,
};
