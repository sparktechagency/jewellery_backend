import { add_info } from "@controllers/info";
import { Router } from "express";
const router = Router();

router.post("/", add_info);

export default router;
