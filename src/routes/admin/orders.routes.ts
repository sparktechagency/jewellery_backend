import { edit_order, get_orders } from "@controllers/orders";
import { Router } from "express";

const router = Router();

router.get("/", get_orders);
router.patch("/", edit_order);

export default router;
