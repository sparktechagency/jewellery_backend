import {
  change_password,
  edit_profile,
  get_profile,
} from "@controllers/profile";
import { Router } from "express";

const router = Router();

router.get("/", get_profile);
router.patch("/edit", edit_profile);
router.post("/change-password", change_password);

export default router;
