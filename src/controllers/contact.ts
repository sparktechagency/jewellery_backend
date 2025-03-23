import { sendEmail } from "@services/emailService";
import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { Contact } from "src/schema";

const contact_us = async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body || {};

  const error = validateRequiredFields({ name, email, phone, message });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  // const payload = {
  //   to: process.env.ADMIN_EMAIL || "safin248@outlook.com",
  //   subject: `New Message from ${name}`,
  //   html: `<p><strong>Name:</strong> ${name}</p>
  //                <p><strong>Email:</strong> ${email}</p>
  //                <p><strong>Phone:</strong> ${phone}</p>
  //                <p><strong>Message:</strong> ${message}</p>`,
  // };

  try {
    // await sendEmail(payload);
    await Contact.create({ name, email, phone, message });
    res.json({ message: "Message sent to admin successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_contact_us = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find({}, { __v: 0 });
    res.json(contacts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { contact_us, get_contact_us };
