import { add_faq, delete_faq, edit_faq } from "@controllers/faq";
import { Router } from "express";

const router = Router();

router.post("/", add_faq);
router.patch("/", edit_faq);
router.delete("/", delete_faq);

export default router;
