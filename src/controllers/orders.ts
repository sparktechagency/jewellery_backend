import { createCheckoutSession } from "@services/stripeService";
import uploadService from "@services/uploadService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { Order, Product } from "src/schema";

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
    await Order.create({
      order_type: "ready-made",
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
        unit_amount: (product.discount_price
          ? product.discount_price
          : product.price) * 100,
      },
      quantity: products.find((p) => p.id === product.id).quantity,
    }));

    const stripe: any = await createCheckoutSession({
      userId: req?.user?.id || "not_logged_in",
      line_items,
    });

    res.json({ message: "Order created successfully", stripe_url: stripe.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { custom_or_repair_order, place_order };
