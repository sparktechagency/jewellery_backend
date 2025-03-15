import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { Info } from "src/schema";

const add_info = async (req: Request, res: Response) => {
  const { page, content } = req?.body || {};

  const error = validateRequiredFields({ page, content });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const pageTypes = [
    "about-us",
    "terms",
    "privacy",
    "shipping",
    "returns",
    "warranty",
    "help",
    "faqs",
  ];

  if (!pageTypes.includes(page)) {
    res.status(400).json({ message: `Invalid page type` });
    return;
  }

  const info = await Info.findOne({ page });

  try {
    await Info.create({ page, content });
    res.json({
      message: `Info for ${page} ${info ? "updated" : "added"} successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_info = async (req: Request, res: Response) => {
  const { page } = req.query || {};

  const info = await Info.findOne({ page }, { __v: 0, _id: 0 });

  if (!info) {
    res.status(404).json({ message: "Info not found" });
    return;
  }

  res.json(info);
};

export { add_info, get_info };
