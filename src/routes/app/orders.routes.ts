import { custom_or_repair_order } from "@controllers/orders";
import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/custom", upload.single("image"), custom_or_repair_order);

export default router;
