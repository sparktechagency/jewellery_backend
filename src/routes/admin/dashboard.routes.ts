import { dashboard } from "@controllers/dashboard";
import { Router } from "express";

const router = Router();

router.get("/", dashboard);

export default router;
