import { get_info } from "@controllers/info";
import { Router } from "express";

const router = Router();

router.get("/", get_info);

export default router;
