import { Router } from "express";
import AuthController from "../../controllers/auth/auth.controller";

const router = Router();

// register
router.post("/register", AuthController.register);

// login
router.post("/login", AuthController.login)

export default router;
