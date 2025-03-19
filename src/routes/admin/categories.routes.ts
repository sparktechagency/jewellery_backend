import {
  add_category,
  delete_category,
  edit_category,
} from "@controllers/categories";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), add_category);
router.patch("/", upload.single("image"), edit_category);
router.delete("/", delete_category);

export default router;
