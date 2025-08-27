import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { ManageContact } from "src/schema";

const addContactInfo = async (req: Request, res: Response) => {
  const { description, contactNumber, email, address } = req?.body || {};

  const error = validateRequiredFields({
    description,
    contactNumber,
    email,
    address,
  });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    await ManageContact.findOneAndUpdate(
      {},
      { description, contactNumber, email, address },
      { upsert: true, new: true }
    );
    const length = await ManageContact.countDocuments();
    if (length > 1) {
      await ManageContact.deleteMany({}, { limit: length - 1 });
    }

    res.json({
      message: `Contact info added successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getContactInfo = async (req: Request, res: Response) => {
  const info = await ManageContact.findOne({});
  if (!info) {
    res.status(200).json({ message: "Contact info not found" });
    return;
  }
  res.json(info);
};

const updateContactInfo = async (req: Request, res: Response) => {
  const { description, contactNumber, email, address } = req?.body || {};
//   const error = validateRequiredFields({
//     description,
//     contactNumber,
//     email,
//     address,
//   });
//   if (error) {
//     res.status(400).json({ message: error });
//     return;
//   }
  try {
    // Build update object with only provided fields
    const updateFields: Partial<{ description: string; contactNumber: string; email: string; address: string }> = {};
    if (description !== undefined) updateFields.description = description;
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;

    const info = await ManageContact.findOneAndUpdate(
      {_id: req.params.id},
      updateFields,
      { new: true }
    );
    if (!info) {
      res.status(404).json({ message: "Contact info not found" });
      return;
    }
    res.json({
      message: "Contact info updated successfully",
      info,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteContactInfo = async (req: Request, res: Response) => {
  try {
    const info = await ManageContact.findOneAndDelete({_id: req.params.id});
    if (!info) {
      res.status(404).json({ message: "Contact info not found" });
      return;
    }
    res.json({ message: "Contact info deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export { addContactInfo, getContactInfo, updateContactInfo, deleteContactInfo };
