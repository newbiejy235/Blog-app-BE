import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import usersConttroller from "../../controllers/users/users.conttroller";

const router = Router()

// get user by id
router.get('/:userId', authenticate, usersConttroller.getPostByUserId )
// get data post user by id
router.get('/:userId/posts/:postId', authenticate, usersConttroller.getUserPost )

export default router