import { Router } from "express";
import favoriteController from "../../controllers/Favorite/favorite.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router()

router.post("/")