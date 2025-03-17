import uploadService from "@services/uploadService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { Category, Product } from "src/schema";

const add_product = async (req: Request, res: Response) => {
  const {
    name,
    category,
    availability,
    price,
    discount_price,
    description,
    details,
    colors,
    sizes,
  } = req.body;
  const images = req.files as Express.Multer.File[];

  const error = validateRequiredFields({ name, category, availability, price });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    await Category.findById(category);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid category id" });
    return;
  }

  if (!["in_stock", "stock_out", "upcoming"].includes(availability)) {
    res.status(400).json({ message: "Invalid availability value" });
    return;
  }

  if (discount_price >= price) {
    res
      .status(400)
      .json({ message: "Discount price has to be lower than regular price" });
    return;
  }

  try {
    const image_urls = images
      ? await Promise.all(
          images.map(async (img: any) => await uploadService(img, "image"))
        )
      : [];
    await Product.create({
      name,
      category,
      availability,
      price,
      discount_price,
      description,
      details,
      colors: JSON.parse(colors),
      sizes: JSON.parse(sizes),
      image_urls,
    });

    res.json({
      message: "Product added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { add_product };
