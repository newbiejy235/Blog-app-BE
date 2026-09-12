import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import markController from "../../controllers/mark/mark.controller";
const router = Router();

router.get("/", authenticate, markController.getMarkUser )
router.post("/post", authenticate, markController.postMarkUser )

export default router