import { AuthenticatedRequest } from "@middleware/auth";
import { triggerNotification } from "@services/notificationService";
import { createCheckoutSession } from "@services/stripeService";
import uploadService from "@services/uploadService";
import { verifyAccessToken } from "@utils/jwt";
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
  const token = req.headers.authorization?.split(" ")[1];
  let decoded;
  if (token) {
    decoded = verifyAccessToken(token);
  }
  try {
    await Order.create({
      order_type: type,
      user: decoded?.id,
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
    if (type === "custom") {
      triggerNotification("NEW_CUSTOM_ORDER", {});
    } else if (type === "repair") {
      triggerNotification("NEW_REPAIR_ORDER", {});
    }
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
  const token = req.headers.authorization?.split(" ")[1];
  let decoded;
  if (token) {
    decoded = verifyAccessToken(token);
  }
  try {
    const order = await Order.create({
      order_type: "ready-made",
      user: decoded?.id,
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

    // Add shipping charge as a separate line item
    const SHIPPING_CHARGE = 500; // $5.00 in cents, adjust as needed
    line_items.push({
      price_data: {
      currency: "usd",
      product_data: {
        name: "Shipping Charge",
      },
      unit_amount: SHIPPING_CHARGE,
      },
      quantity: 1,
    });

    const stripe: any = await createCheckoutSession({
      userId: order._id.toString(),
      line_items,
    });

    triggerNotification("NEW_ORDER", {});
    res.json({ message: "Order created successfully", stripe_url: stripe.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_orders = async (req: Request, res: Response) => {
  const { type, page = 1, limit = 10, searchTerm } = req.query;

  const error = validateRequiredFields({ type });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    // Only support "ready-made" or "custom" types
    let filters: any = {};
    if (type === "ready-made") {
      filters = { order_type: "ready-made" };
    } else if (type === "custom/ready-made") {
      filters = { order_type: { $ne: "ready-made" } };
    } else {
      res.status(400).json({ message: "Invalid type. Use 'ready-made' or 'custom'." });
      return;
    }

    // Add searchTerm filter
    let searchFilter = {};
    if (searchTerm && typeof searchTerm === "string" && searchTerm.trim() !== "") {
      const regex = new RegExp(searchTerm, "i");
      if (filters.order_type === "ready-made") {
        searchFilter = {
          $or: [
            { "ready_made_details.shipping_address": regex },
            { "ready_made_details.city": regex },
            { "ready_made_details.state": regex },
            { "ready_made_details.zip": regex },
          ],
        };
      } else {
        searchFilter = {
          $or: [
            { "custom_order_details.name": regex },
            { "custom_order_details.email": regex },
            { "custom_order_details.phone": regex },
            { "custom_order_details.address": regex },
            { "custom_order_details.jewelry_type": regex },
            { "custom_order_details.description": regex },
          ],
        };
      }
    }

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const totalContacts = await Order.countDocuments({ ...filters, ...searchFilter });
    const totalPages = Math.ceil(totalContacts / pageSize);

    const ordersRaw = await Order.find({ ...filters, ...searchFilter })
      .populate([
        {
          path: "ready_made_details.products.product_id",
          model: "Product",
        },
        {
          path: "user",
          select: "name email phone",
        },
      ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    // Always return all possible fields for both types
    const orders = ordersRaw.map((order: any) => {
      const base = {
        id: order._id,
        order_type: order.order_type,
        order_status: order.order_status,
        payment_status: order.payment_status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      // Ready-made fields
      const readyMadeFields = {
        shipping_address: order.ready_made_details?.shipping_address,
        city: order.ready_made_details?.city,
        state: order.ready_made_details?.state,
        zip: order.ready_made_details?.zip,
        orderDate: order.createdAt,
        totalPrice: order.ready_made_details?.products
          ? order.ready_made_details.products.reduce(
              (total: number, p: any) =>
                total +
                (p.product_id?.discount_price
                  ? p.product_id?.discount_price * p.quantity
                  : p.product_id?.price * p.quantity),
              0
            ) + 5 // Adding flat $5 shipping charge
          : undefined,
        customerName: order.user?.name,
        customerEmail: order.user?.email,
        customerPhone: order.user?.phone,
        products: (order.ready_made_details?.products || []).map((p: any) => ({
          product_id: p.product_id?._id || p.product_id,
          product_name: p.product_id?.name,
          quantity: p.quantity,
          price: p.product_id?.price,
          discount_price: p.product_id?.discount_price,
        })),
      };

      // Custom/repair fields
      const customFields = {
        name: order.custom_order_details?.name,
        email: order.custom_order_details?.email,
        phone: order.custom_order_details?.phone,
        address: order.custom_order_details?.address,
        jewelry_type: order.custom_order_details?.jewelry_type,
        description: order.custom_order_details?.description,
        image_url: order.custom_order_details?.image_url,
        custom_order_price: order.custom_order_price,
      };

      return {
        ...base,
        ...readyMadeFields,
        ...customFields,
      };
    });

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
      triggerNotification("PAYMENT_CONFIRMED", {});
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
    }).populate({
      path: "ready_made_details.products.product_id",
      model: "Product",
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
