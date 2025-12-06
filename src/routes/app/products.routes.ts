import {
  add_remove_favorites,
  add_review,
  get_favorites,
  get_popular_products,
  get_product,
  get_products,
  get_reviews,
} from "@controllers/products";
import authorize from "@middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/review", get_reviews);
router.post("/review",authorize(["user"]), add_review);

router.get("/favorites", authorize(["user"]), get_favorites);
router.post("/favorites", authorize(["user"]), add_remove_favorites);

router.get("/", get_products);
router.get("/popular", get_popular_products);
router.get("/:id", get_product);

export default router;
