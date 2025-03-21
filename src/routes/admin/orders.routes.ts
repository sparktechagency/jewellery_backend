import { get_orders } from "@controllers/orders";
import { Router } from "express";

const router = Router();

router.get("/", get_orders);

export default router;
