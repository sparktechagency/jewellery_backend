import { get_faq } from "@controllers/faq";
import { Router } from "express";

const router = Router();

router.get("/", get_faq);

export default router;
