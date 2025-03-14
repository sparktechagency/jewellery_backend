import { get_favorites, update_favorites } from "@controllers/favorites";
import { Router } from "express";

const router = Router();

router.post("/", get_favorites);
router.post("/update", update_favorites);

export default router;
