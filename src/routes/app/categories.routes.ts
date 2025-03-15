import { get_categories, get_category } from "@controllers/categories";
import { Router } from "express";

const router = Router();

router.get("/", get_categories);
router.get("/:id", get_category);

export default router;
