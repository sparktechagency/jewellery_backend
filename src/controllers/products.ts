import { AuthenticatedRequest } from "@middleware/auth";
import uploadService from "@services/uploadService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { Category, Favorite, Order, Product, Review } from "src/schema";

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

  if (
    discount_price !== undefined &&
    discount_price !== null &&
    Number(discount_price) >= Number(price)
  ) {
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
    // subcategory,
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

  // if (subcategory) {
  //   try {
  //     const subcat = await Category.findById(subcategory);
  //     if (subcat?.subcategory_of?.toString() !== category) {
  //       res
  //         .status(400).json({ message: "Invalid subcategory for the given category" });
  //       return;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(400).json({ message: "Invalid subcategory id" });
  //     return;
  //   }
  // }

  if (
    availability &&
    !["in_stock", "stock_out", "upcoming"].includes(availability)
  ) {
    res.status(400).json({ message: "Invalid availability value" });
    return;
  }

  if (discount_price && Number(discount_price) >= Number(price)) {
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
      // ...(subcategory && { subcategory }),
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

const delete_product = async (req: Request, res: Response) => {
  const { id } = req.body || {};

  if (!id || !isObjectIdOrHexString(id)) {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  const product = await Product.findById(id);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  try {
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
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

  const product = await Product.findById(product_id);

  if (!product) {
    res.status(400).json({ message: "Invalid product_id" });
    return;
  }

  try {
    await Review.create({
      product: product_id,
      rating,
      name,
      email,
      review,
    });
    product.ratings.push(rating);
    await product.save();
    res.json({ message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_reviews = async (req: Request, res: Response) => {
  const { product_id, page, limit, rating, sort } = req.query || {};

  if (!product_id || !isObjectIdOrHexString(product_id)) {
    res.status(400).json({ message: "Invalid product_id" });
    return;
  }

  const pageNumber = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const filters = {
    product: product_id,
    ...(rating && { rating }),
  };

  const sortOption: { [key: string]: 1 | -1 } =
    sort === "asc"
      ? { createdAt: 1 }
      : sort === "desc"
      ? { createdAt: -1 }
      : {};

  const reviews = await Review.find(filters, { __v: 0 })
    .skip(skip)
    .limit(pageSize)
    .sort(sortOption);

  const totalReviews = await Review.countDocuments(filters);
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

const get_favorites = async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query || {};

  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const totalContacts = await Favorite.countDocuments({ user: req.user?.id });
    const totalPages = Math.ceil(totalContacts / pageSize);

    const favorite_ids = (await Favorite.find({ user: req.user?.id })).map(
      (fav) => fav.product
    );
    const products = await Product.find(
      { _id: { $in: favorite_ids } },
      {
        __v: 0,
        description: 0,
        details: 0,
        colors: 0,
        sizes: 0,
        reviews: 0,
        category: 0,
        availability: 0,
      }
    )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagination = {
      totalContacts,
      totalPages,
      currentPage: pageNumber,
      pageSize,
    };
    res.json({ products, pagination });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_products = async (req: Request, res: Response) => {
  const {
    query,
    searchTerm,
    price_min,
    price_max,
    availability,
    rating,
    sort,
    category,
    subcategory,
    page,
    limit,
  } = req.query || {};

  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Combine query and searchTerm for searching product names/descriptions
    const searchFilter =
      (query || searchTerm)
        ? {
            $or: [
              ...(query ? [{ name: { $regex: query, $options: "i" } }] : []),
              ...(searchTerm ? [
                { name: { $regex: searchTerm, $options: "i" } },
                {details: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } },
              ] : []),
            ],
          }
        : {};

    const filters: any = {
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...searchFilter,
      ...(price_min && { price: { $gte: Number(price_min) } }),
      ...(price_max && { price: { $lte: Number(price_max) } }),
      ...(price_min &&
        price_max && {
          price: { $gte: Number(price_min), $lte: Number(price_max) },
        }),
      ...(availability && { availability }),
      ...(rating && {
        $expr: {
          $gte: [
            {
              $avg: "$ratings",
            },
            Number(rating),
          ],
        },
      }),
    };

    const sortOption: { [key: string]: 1 | -1 } =
      sort === "low_to_high"
        ? { price: 1 }
        : sort === "high_to_low"
        ? { price: -1 }
        : {};

    const productsWithRatings = await Product.find({
      ...filters,
      ratings: { $ne: [] },
    })
      .populate([
        {
          path: "category",
          populate: { path: "subcategory_of" },
        },
        // {
        //   path: "subcategory",
        //   populate: { path: "subcategory_of" },
        // },
      ])
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    const productsWithoutRatings = await Product.find({
      ...filters,
      ratings: [],
    })
      .populate([
        {
          path: "category",
          populate: { path: "subcategory_of" },
        },
        // {
        //   path: "subcategory",
        //   populate: { path: "subcategory_of" },
        // },
      ])
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    const products = [...productsWithRatings, ...productsWithoutRatings];

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / pageSize);

    const pagination = {
      totalProducts,
      totalPages,
      currentPage: pageNumber,
      pageSize,
    };

    res.json({ products, pagination });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_popular_products = async (req: Request, res: Response) => {
  try {
    const topOrderedProducts = await Order.aggregate([
      { $match: { order_type: "ready-made" } },
      { $unwind: "$ready_made_details.products" },
      {
        $group: {
          _id: "$ready_made_details.products.product_id",
          orderCount: { $sum: "$ready_made_details.products.quantity" },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
    ]);

    const orderedProductIds = topOrderedProducts.map((p) => p._id);

    let products = await Product.find({ _id: { $in: orderedProductIds } });

    // If less than 10, fetch additional recent/random products
    if (products.length < 10) {
      const needed = 10 - products.length;
      const additionalProducts = await Product.find({
        _id: { $nin: orderedProductIds },
      })
        .sort({ createdAt: -1 }) // Can change to .aggregate([{ $sample: { size: needed } }]) for random
        .limit(needed);
      console.log({additionalProducts});
      
      products = [...products, ...additionalProducts];
    }

    res.status(200).json(products.slice(0, 10));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  add_product,
  edit_product,
  delete_product,
  get_product,
  add_review,
  get_reviews,
  add_remove_favorites,
  get_favorites,
  get_products,
  get_popular_products,
};
