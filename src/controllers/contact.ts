import { sendEmail } from "@services/emailService";
import { Request, Response } from "express";

const contact_us = async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body || {};

  const payload = {
    to: process.env.ADMIN_EMAIL || "safin248@outlook.com",
    subject: `New Message from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Phone:</strong> ${phone}</p>
                 <p><strong>Message:</strong> ${message}</p>`,
  };

  try {
    await sendEmail(payload);
    res.json({ message: "Message sent to admin successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { contact_us };
