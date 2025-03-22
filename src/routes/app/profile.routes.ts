import {
  change_password,
  edit_profile,
  get_profile,
} from "@controllers/profile";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/", get_profile);
router.patch("/edit", upload.single("photo"), edit_profile);
router.post("/change-password", change_password);

export default router;
