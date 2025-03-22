import { ban_user, get_users } from "@controllers/users";
import { Router } from "express";

const router = Router();

router.get("/", get_users);
router.patch("/:id", ban_user);

export default router;
