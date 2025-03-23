import { get_contact_us } from "@controllers/contact";
import { Router } from "express";

const router = Router();

router.get("/", get_contact_us);

export default router;
