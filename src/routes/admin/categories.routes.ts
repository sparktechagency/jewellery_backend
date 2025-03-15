import { add_category } from "@controllers/categories";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), add_category);

export default router;
