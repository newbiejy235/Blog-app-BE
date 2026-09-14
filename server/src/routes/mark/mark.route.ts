import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import markController from "../../controllers/mark/mark.controller";
const router = Router();

router.post("/post", authenticate, markController.postMarkUser);
router.delete("/post/:postId", authenticate, markController.deleteMarkUser);
router.get("/", authenticate, markController.getMarkUser); // pastiin ini juga pakai authenticate

export default router;
