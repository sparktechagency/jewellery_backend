import uploadService from "@services/uploadService";
import { Request, Response } from "express";
import { Category } from "src/schema";

const add_category = async (req: Request, res: Response) => {
  const { parent, name, details } = req?.body || {};
  const image = req.file;

  if (!parent) {
    // create categories
    const category = await Category.findOne({ name });

    if (category && !category.subcategory_of) {
      res.status(400).json({
        message: `Category ${name} already exists`,
      });
      return;
    }

    try {
      const img_url = await uploadService(image, "image");
      await Category.create({ name, details, img_url });
      res.json({ message: "Category created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  } else {
    // create subcategories
    const parentId = await Category.findOne({ name: parent });
    if (!parentId) {
      res.status(400).json({
        message: `Invalid parent name`,
      });
      return;
    }

    const subcategory = await Category.findOne({
      name,
      subcategory_of: parentId,
    });

    if (subcategory) {
      res.status(400).json({
        message: `Subcategory ${name} already exists`,
      });
      return;
    }

    try {
      const img_url = await uploadService(image, "image");
      await Category.create({ name, subcategory_of: parentId, img_url });
      res.json({ message: "Subcategory created successfully" });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  }
};

const get_categories = async (req: Request, res: Response) => {
  const { type }: { type?: "nav" | "search" } = req?.query || {};

  let selection;

  if (type === "nav") {
    selection = { __v: 0, details: 0, img_url: 0 };
  } else if (type === "search") {
    selection = { __v: 0, details: 0 };
  }

  const categories = await Category.find(
    { subcategory_of: { $exists: false } },
    selection
  );

  res.json(categories);
};

const get_category = async (req: Request, res: Response) => {
  const { id } = req.params || {};

  const category = await Category.findById(id, { __v: 0 });

  const subcategories = await Category.find(
    { subcategory_of: id },
    { __v: 0, subcategory_of: 0 }
  );

  res.json({
    ...category?.toObject(),
    subcategories,
  });
};

export { add_category, get_categories, get_category };
