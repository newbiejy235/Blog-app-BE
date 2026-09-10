import { Request, Response } from "express";
import {
  createPostSchema,
  getBySearch,
  getCategories,
  postIdSchema,
  updatePostParamsSchema,
  updatePostSchema,
} from "../../validations/post.validation";
import { db } from "../../config/db";
import { postsTable } from "../../config/schema";
import { eq, and, desc, like } from "drizzle-orm";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../service/cloudinary.service";

export class PostController {
  crreatePost = async (req: Request, res: Response) => {
    try {
      const validateData = createPostSchema.parse(req.body);
      const { userId, title, content, kategoriId } = validateData;

      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;

      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      }

      const [insertedPost] = await db
        .insert(postsTable)
        .values({ userId, title, content, imageUrl, imagePublicId, kategoriId })
        .$returningId();
      // .values()
      // .$returningId();

      const newPost = await db.query.postsTable.findFirst({
        where: eq(postsTable.id, insertedPost.id),
      });

      return res.status(201).json({
        success: true,
        message: "Image post siccessfully",
        data: {
          post: newPost,
        },
      });
    } catch (error) {
      console.error("Failed to post image,error : ", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  getByCategories = async (req: Request, res: Response) => {
    try {
      const validateData = getCategories.parse(req.params);
      const { kategoriId } = validateData;
      const data = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.kategoriId, kategoriId));
      return res.json({
        success: true,
        message: "berhasil get",
        data: {
          postData: data,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error,
      });
    }
  };

  getBySearch = async (req: Request, res: Response) => {
    try {
      const validateData = getBySearch.parse(req.params);
      const { title } = validateData;
      const data = await db
        .select()
        .from(postsTable)
        .where(like(postsTable.title, `%${title}%`));

      if (data.length == 0) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }
      return res.json({
        success: true,
        message: "berhasil get",
        data: {
          postData: data,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error,
      });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await db
        .select()
        .from(postsTable)
        .orderBy(desc(postsTable.createdAt))
        .where(eq(postsTable.status, "published"));
      return res.json({
        success: true,
        message: "berhasil get",
        data: {
          postData: data,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error,
      });
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.id);

      const result = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId));

      return res.json({
        success: true,
        message: "berhasil get",
        data: {
          postData: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error,
      });
    }
  };

  updatePost = async (req: Request, res: Response) => {
    try {
      const validatedParams = updatePostParamsSchema.parse(req.params);
      const { id } = validatedParams;

      const validateData = updatePostSchema.parse(req.body);
      const { title, content } = validateData;

      const [existingPost] = await db.select().from(postsTable);

      if (!existingPost) {
        return res.status(404).json({
          success: false,
          message: "post not found",
        });
      }

      let imageUrl = existingPost.imageUrl;
      let imagePublicId = existingPost.imagePublicId;

      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      }

      if (existingPost.imagePublicId) {
        await deleteFromCloudinary(existingPost.imagePublicId);
      }

      await db
        .update(postsTable)
        .set({
          ...(title !== undefined && {
            title,
          }),

          ...(content !== undefined && {
            content,
          }),

          ...(req.file && {
            imageUrl,
            imagePublicId,
          }),
        })
        .where(eq(postsTable.id, id));

      const [updatePost] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, id));

      return res.status(200).json({
        success: true,
        message: "post update successfully",
        data: {
          post: updatePost,
        },
      });
    } catch (error: any) {
      console.error("update ppost error: ", error);
      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: error.message,
      });
    }
  };

  deletePost = async (req: Request, res: Response) => {
    try {
      const validatedParams = postIdSchema.parse(req.params);
      const { id } = validatedParams;

      const existingPost = await db.query.postsTable.findFirst({
        where: eq(postsTable.id, id),
      });

      if (!existingPost) {
        return res.status(404).json({
          success: false,
          message: "post not found",
        });
      }

      await db
        .update(postsTable)
        .set({ status: "delete" })
        .where(eq(postsTable.id, id));

      return res.status(200).json({
        success: true,
        message: "post deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete post error :", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
}

export default new PostController();
