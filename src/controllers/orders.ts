import uploadService from "@services/uploadService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { Order } from "src/schema";

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

export { custom_or_repair_order };
