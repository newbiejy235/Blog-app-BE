import { Router } from "express";
import favoriteController from "../../controllers/Favorite/favorite.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, favoriteController.getFavorite);
router.post("/liked", authenticate, favoriteController.postFavorite);
router.post("/disliked", authenticate, favoriteController.deleteFavorite);



export default router;
