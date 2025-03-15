import { get_appointments } from "@controllers/appointment";
import { Router } from "express";

const router = Router();

router.get("/", get_appointments);

export default router;
