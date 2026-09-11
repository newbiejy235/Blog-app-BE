import { Router } from "express";
import favoriteController from "../../controllers/Favorite/favorite.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router()

router.post("/", authenticate, favoriteController.postFavorite)
router.delete(
  "/:userId/post/:postId",
  authenticate,
  favoriteController.deleteFavorite
);
router.get("/:userId/post/:postId", authenticate, favoriteController.getFavorite)

export default router
