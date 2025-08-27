import { addContactInfo, deleteContactInfo, getContactInfo, updateContactInfo } from "@controllers/manageContact";
import { Router } from "express";
const router = Router();

router.post("/", addContactInfo);
router.get("/", getContactInfo);
router.put("/:id", updateContactInfo);
router.delete("/:id", deleteContactInfo);


export default router;