import { Request, Response } from "express";
import { Category } from "src/schema";

const add_category = async (req: Request, res: Response) => {
  const { name, parent } = req?.body || {};

  const category = await Category.findOne({ name });

  if (category && !parent) {
    res.status(400).json({
      message: `Category ${name} already exists`,
    });
    return;
  }

  let parentId;

  if (parent) {
    parentId = await Category.findOne({ name: parent });

    if (!parentId) {
      res.status(400).json({
        message: `Invalid parent name`,
      });
      return;
    } else {
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
        await Category.create({ name, subcategory_of: parentId });
        res.json({ message: "Subcategory created successfully" });
        return;
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
    }
  }

  try {
    await Category.create({ name });
    res.json({ message: "Category created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export { add_category };
