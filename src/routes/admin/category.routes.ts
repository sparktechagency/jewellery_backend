import { add_category } from "@controllers/category";
import { Router } from "express";

const router = Router();

router.post("/", add_category);

export default router;
