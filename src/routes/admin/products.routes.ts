import { add_product } from "@controllers/products";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("images"), add_product);

export default router;
