import { AuthenticatedRequest } from "@middleware/auth";
import uploadService from "@services/uploadService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { Category, Favorite, Product, Review } from "src/schema";

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

const edit_product = async (req: Request, res: Response) => {
  const {
    id,
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

  if (!id || !isObjectIdOrHexString(id)) {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  const product = await Product.findById(id);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  if (category) {
    try {
      await Category.findById(category);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Invalid category id" });
      return;
    }
  }

  if (
    availability &&
    !["in_stock", "stock_out", "upcoming"].includes(availability)
  ) {
    res.status(400).json({ message: "Invalid availability value" });
    return;
  }

  if (discount_price && discount_price >= price) {
    res
      .status(400)
      .json({ message: "Discount price has to be lower than regular price" });
    return;
  }

  try {
    const image_urls =
      images.length > 0
        ? await Promise.all(
            images.map(async (img: any) => await uploadService(img, "image"))
          )
        : [];

    const updatePayload = {
      ...(name && { name }),
      ...(category && { category }),
      ...(availability && { availability }),
      ...(price && { price }),
      ...(discount_price && { discount_price }),
      ...(description && { description }),
      ...(details && { details }),
      ...(colors && { colors: JSON.parse(colors) }),
      ...(sizes && { sizes: JSON.parse(sizes) }),
      ...(images.length > 0 && { image_urls }),
    };
    await product.updateOne(updatePayload);

    res.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_product = async (req: Request, res: Response) => {
  const { id } = req?.params || {};
  const product = await Product.findById(id, { __v: 0, reviews: 0 });

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const similarProducts = await Product.find(
    { category: product.category, _id: { $ne: product._id } },
    { _id: 0, __v: 0 }
  ).limit(5);

  res.json({ product, similarProducts });
};

const add_review = async (req: Request, res: Response) => {
  const { product_id, rating, name, email, review } = req.body || {};

  const error = validateRequiredFields({
    product_id,
    rating,
    name,
    email,
    review,
  });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    await Review.create({ product: product_id, rating, name, email, review });
    res.json({ message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_reviews = async (req: Request, res: Response) => {
  const { product_id, page, limit } = req.query || {};

  if (!product_id || !isObjectIdOrHexString(product_id)) {
    res.status(400).json({ message: "Invalid product_id" });
    return;
  }

  const pageNumber = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const reviews = await Review.find({ product: product_id }, { __v: 0 })
    .skip(skip)
    .limit(pageSize);

  const totalReviews = await Review.countDocuments({ product: product_id });
  const totalPages = Math.ceil(totalReviews / pageSize);

  res.json({
    reviews,
    pagination: {
      totalReviews,
      totalPages,
      currentPage: pageNumber,
      pageSize,
    },
  });
};

const add_remove_favorites = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { product_id, type }: { product_id: string; type: "add" | "remove" } =
    req.body || {};

  if (!isObjectIdOrHexString(product_id)) {
    res.status(400).json({ message: "Invalid product_id" });
    return;
  }

  const product = await Product.findById(product_id);

  if (!product) {
    res.status(400).json({ message: "Invalid product_id" });
    return;
  }

  if (type === "add") {
    const favorite = await Favorite.findOne({
      user: req.user?.id,
      product: product_id,
    });

    if (favorite) {
      res.status(400).json({ message: "Already added to favorites" });
      return;
    }

    try {
      await Favorite.create({ user: req.user?.id, product: product_id });
      res.json({ message: "Added to favorites successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  if (type === "remove") {
    const favorite = await Favorite.findOne({
      user: req.user?.id,
      product: product_id,
    });

    if (!favorite) {
      res.status(400).json({ message: "Product not added to favorites" });
      return;
    }

    try {
      await Favorite.deleteMany({ user: req.user?.id, product: product_id });
      res.json({ message: "Product removed from favorites successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const get_favorites = async (req: Request, res: Response) => {};

export {
  add_product,
  edit_product,
  get_product,
  add_review,
  get_reviews,
  add_remove_favorites,
  get_favorites,
};
