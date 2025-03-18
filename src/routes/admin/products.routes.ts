import { add_product, edit_product } from "@controllers/products";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("images"), add_product);
router.patch("/", upload.array("images"), edit_product);

export default router;
