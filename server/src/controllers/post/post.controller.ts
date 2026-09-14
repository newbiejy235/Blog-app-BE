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
import { favoritesTable, postsTable, markTable } from "../../config/schema";
import { eq, and, desc, like, count, sql } from "drizzle-orm";
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
        .where(
          and(
            eq(postsTable.kategoriId, kategoriId),
            eq(postsTable.status, "published"),
          ),
        );
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

  // search
  getBySearch = async (req: Request, res: Response) => {
    try {
      const validateData = getBySearch.parse(req.params);
      const { title } = validateData;
      const data = await db
        .select()
        .from(postsTable)
        .where(
          and(
            eq(postsTable.status, "published"),
            like(postsTable.title, `%${title}%`),
          ),
        );

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

  getIsUserAuth = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const data = await db
        .select({
          id: postsTable.id,
          userId: postsTable.userId,
          title: postsTable.title,
          content: postsTable.content,
          kategoriId: postsTable.kategoriId,
          imageUrl: postsTable.imageUrl,
          imagePublicId: postsTable.imagePublicId,
          status: postsTable.status,
          createdAt: postsTable.createdAt,
          updatedAt: postsTable.updatedAt,

          favoriteStatus: favoritesTable.status,
          markStatus: markTable.status,

          // fix favorite count
          favoriteCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM favorites
      WHERE favorites.post_id = ${postsTable.id}
      AND favorites.status = 'like'
    )
  `.mapWith(Number),
        })
        .from(postsTable)
        .leftJoin(
          favoritesTable,
          and(
            eq(postsTable.id, favoritesTable.postId), // and() tidak wajib jika hanya 1 kondisi
            eq(favoritesTable.userId, userId),
          ),
        )
        .leftJoin(
          markTable,
          and(
            eq(postsTable.id, markTable.postId),
            eq(markTable.userId, userId),
          ),
        )
        .where(eq(postsTable.status, "published"))
        .orderBy(desc(postsTable.createdAt))
        .groupBy(
          postsTable.id,
          postsTable.userId,
          postsTable.title,
          postsTable.content,
          postsTable.kategoriId,
          postsTable.imageUrl,
          postsTable.imagePublicId,
          postsTable.status,
          postsTable.createdAt,
          postsTable.updatedAt,
          favoritesTable.status,
          markTable.status,
        );

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
        error: error instanceof Error ? error.message : error, // Lebih aman untuk log
      });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await db
        .select({
          id: postsTable.id,
          userId: postsTable.userId,
          title: postsTable.title,
          content: postsTable.content,
          kategoriId: postsTable.kategoriId,
          imageUrl: postsTable.imageUrl,
          imagePublicId: postsTable.imagePublicId,
          status: postsTable.status,
          createdAt: postsTable.createdAt,
          updatedAt: postsTable.updatedAt,

          // favoriteStatus: favoritesTable.status,

          // UBAH BAGIAN INI: Hanya hitung jika status di tabel favorit adalah 'like'
          favoriteCount:
            sql<number>`count(case when ${favoritesTable.status} = 'like' then 1 end)`.mapWith(
              Number,
            ),
        })
        .from(postsTable)
        .leftJoin(
          favoritesTable,
          eq(postsTable.id, favoritesTable.postId), // and() tidak wajib jika hanya 1 kondisi
        )
        .where(eq(postsTable.status, "published"))
        .orderBy(desc(postsTable.createdAt))
        .groupBy(
          postsTable.id,
          postsTable.userId,
          postsTable.title,
          postsTable.content,
          postsTable.kategoriId,
          postsTable.imageUrl,
          postsTable.imagePublicId,
          postsTable.status,
          postsTable.createdAt,
          postsTable.updatedAt,
          // favoritesTable.status,
        );

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
        error: error instanceof Error ? error.message : error, // Lebih aman untuk log
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
