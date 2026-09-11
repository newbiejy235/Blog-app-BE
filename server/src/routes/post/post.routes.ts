import { Router } from "express";
import { uploadSingleImages } from "../../middleware/upload.midleware";
import PostController from "../../controllers/post/post.controller";
import { authenticate } from "../../middleware/auth.middleware";
import postController from "../../controllers/post/post.controller";

const router = Router();
// ambil semua data post dari user yang sudah login
router.post("/", authenticate, uploadSingleImages, PostController.crreatePost);
// ambil semua data post
router.get("/", uploadSingleImages, PostController.getAll);

router.get("/detail/:id", uploadSingleImages, PostController.detail);
// kategori
router.get("/:kategoriId", uploadSingleImages, PostController.getByCategories);
// search
router.get("/search/:title", uploadSingleImages, PostController.getBySearch);

router.patch("/:id", 
    authenticate,
    uploadSingleImages, PostController.updatePost
)


router.delete("/:id", 
    authenticate,
    postController.deletePost
)

export default router;
