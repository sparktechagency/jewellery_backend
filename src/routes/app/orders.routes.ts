import {
  custom_or_repair_order,
  get_user_orders,
  place_order,
} from "@controllers/orders";
import authorize from "@middleware/auth";
import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/custom", upload.single("image"), custom_or_repair_order);

router.post("/", place_order);
router.get("/", authorize(["user"]), get_user_orders);

export default router;
