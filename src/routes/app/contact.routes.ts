import { contact_us } from "@controllers/contact";
import { Router } from "express";

const router = Router();

router.post("/", contact_us);

export default router;
