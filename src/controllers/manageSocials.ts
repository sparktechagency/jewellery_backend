import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { ManageSocial } from "src/schema";

const addSocialInfo = async (req: Request, res: Response) => {
  const { platform, url, icon } = req?.body || {};
    const error = validateRequiredFields({
    platform,
    url,
  });
    if (error) {
    res.status(400).json({ message: error });
    return;
  }
    try {
    await ManageSocial.create({ platform, url, icon });
    // const length = await ManageContact.countDocuments();
    // if (length > 1) {
    //   await ManageContact.deleteMany({}, { limit: length - 1 });
    // }
    res.json({
      message: `Social info added successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  } 
};

const getSocialInfo = async (req: Request, res: Response) => {
  const info = await ManageSocial.findOne({});
  if (!info) {
    res.status(200).json({ message: "Social info not found" });
    return;
  }
  res.json(info);
};

const updateSocialInfo = async (req: Request, res: Response) => {
  const { platform, url, icon } = req?.body || {};
//   const error = validateRequiredFields({ 
//     platform,
//     url,
//   });
//   if (error) {
//     res.status(400).json({ message: error });
//     return;  


//   }  const { id } = req.params;
  try {
    const updatedInfo = await ManageSocial.findByIdAndUpdate(  
        req.params.id,
        { platform, url, icon },
        { new: true }
    );  
    if (!updatedInfo) {
      res.status(404).json({ message: "Social info not found" });
      return;
    }
    res.json({ message: "Social info updated successfully", updatedInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteSocialInfo = async (req: Request, res: Response) => {
    try {
    const deletedInfo = await ManageSocial.findByIdAndDelete(req.params.id);
    if (!deletedInfo) {
      res.status(404).json({ message: "Social info not found" });
      return;
    }   
    res.json({ message: "Social info deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  } 
};

export { addSocialInfo, getSocialInfo, updateSocialInfo, deleteSocialInfo };