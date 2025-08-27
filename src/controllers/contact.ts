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
  const { page = 1, limit = 10 } = req.query || {};
  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const totalContacts = await Contact.countDocuments();
    const totalPages = Math.ceil(totalContacts / pageSize);

    const contacts = await Contact.find({})
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagination = {
      totalContacts,
      totalPages,
      currentPage: pageNumber,
      pageSize,
    };

    res.json({ contacts, pagination });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { contact_us, get_contact_us };
