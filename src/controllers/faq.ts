import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { FAQ } from "src/schema";

const add_faq = async (req: Request, res: Response) => {
  const { question, answer } = req.body || {};

  const error = validateRequiredFields({ question, answer });

  if (error) {
    res.status(500).json({ message: error });
    return;
  }

  try {
    await FAQ.create({ question, answer });
    res.json({ message: "FAQ added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_faq = async (req: Request, res: Response) => {
  try {
    const faq = await FAQ.find({}, { __v: 0 });
    res.json(faq);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const edit_faq = async (req: Request, res: Response) => {
  const { id, question, answer } = req.body;

  if (!id || !isObjectIdOrHexString(id)) {
    res.status(500).json({ message: "Invalid id" });
    return;
  }

  const faq = await FAQ.findById(id);

  if (!faq) {
    res.status(500).json({ message: "Invalid id" });
    return;
  }

  try {
    await faq.updateOne({ question, answer });
    res.json({ message: "FAQ updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const delete_faq = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id || !isObjectIdOrHexString(id)) {
    res.status(500).json({ message: "Invalid id" });
    return;
  }

  const faq = await FAQ.findById(id);

  if (!faq) {
    res.status(500).json({ message: "Invalid id" });
    return;
  }

  try {
    await faq.deleteOne();
    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { add_faq, get_faq, edit_faq, delete_faq };
