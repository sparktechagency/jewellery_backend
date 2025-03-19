import {
  add_remove_favorites,
  add_review,
  get_product,
  get_reviews,
} from "@controllers/products";
import authorize from "@middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/review", get_reviews);
router.post("/review", add_review);
router.get("/:id", get_product);

router.get("/favorites", authorize(["user"]), get_product);
router.post("/favorites", authorize(["user"]), add_remove_favorites);

export default router;
