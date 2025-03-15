import {
  get_unavailable_times,
  book_an_appointment,
} from "@controllers/appointment";
import { Router } from "express";

const router = Router();

router.get("/", get_unavailable_times);
router.post("/", book_an_appointment);

export default router;
