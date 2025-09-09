import { addSocialInfo, deleteSocialInfo, getSocialInfo, updateSocialInfo } from "@controllers/manageSocials";
import { Router } from "express";
const router = Router();

router.post("/", addSocialInfo);
router.get("/", getSocialInfo);
router.put("/:id", updateSocialInfo);
router.delete("/:id", deleteSocialInfo);


export default router;