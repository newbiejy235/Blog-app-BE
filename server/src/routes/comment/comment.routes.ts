import { Router } from "express";
import commentController from "../../controllers/comment/comment.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// menambahkan komentar
router.post("/", authenticate, commentController.postComment);
router.get("/:postId", commentController.getComment);


export default router;
