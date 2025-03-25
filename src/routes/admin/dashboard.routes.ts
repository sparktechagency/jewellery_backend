import { dashboard, notifications } from "@controllers/dashboard";
import { Router } from "express";

const router = Router();

router.get("/", dashboard);
router.get("/notifications", notifications);

export default router;
