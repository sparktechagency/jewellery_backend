import { add_review, get_product, get_reviews } from "@controllers/products";
import { Router } from "express";

const router = Router();

router.get("/review", get_reviews);
router.post("/review", add_review);
router.get("/:id", get_product);

export default router;
