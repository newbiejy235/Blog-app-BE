import { Request, Response } from "express";
import { db } from "../../config/db";
import { favoritesTable, postsTable } from "../../config/schema";
import { favoriteValidation } from "../../validations/favorite.validation";
import { and, eq } from "drizzle-orm";

export class FavoriteController {
  postFavorite = async (req: Request, res: Response) => {
    try {
      const validation = favoriteValidation.parse(req.body);
      const { postId } = validation;
      const userId = (req as any).user?.id; // Ambil ID user dari middleware auth

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // 1. Cek apakah postingan yang mau difavoritkan itu ada
      const blog = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId))
        .limit(1);

      if (blog.length === 0) {
        return res.status(404).json({
          success: false,
          message: "tidak ada postingan",
        });
      }

      // 2. Gunakan upsert (insert jika belum ada, update ke 'like' jika sudah ada)
      // Karena kamu punya uniqueUserPost constraint di schema, ini sangat aman
      await db
        .insert(favoritesTable)
        .values({
          userId: userId,
          postId: postId,
          status: "like",
        })
        .onDuplicateKeyUpdate({
          set: { status: "like" },
        });

      return res.status(200).json({
        success: true,
        message: "berhasil menambahkan ke favorite",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  getFavorite = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id; // Ambil ID user dari middleware auth

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Gunakan LEFT JOIN untuk mengambil data postingan beserta status likenya
      const favorites = await db
        .select({
          id: postsTable.id,
          title: postsTable.title,
          content: postsTable.content,
          imageUrl: postsTable.imageUrl,
          createdAt: postsTable.createdAt,
        })
        .from(favoritesTable)
        .leftJoin(postsTable, eq(favoritesTable.postId, postsTable.id))
        .where(
          and(
            eq(favoritesTable.userId, userId),
            eq(favoritesTable.status, "like"),
            eq(postsTable.status, "published") // Pastikan postnya masih dipublish
          )
        );

      return res.status(200).json({
        success: true,
        message: "berhasil dapat data favorite",
        data: favorites,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  deleteFavorite = async (req: Request, res: Response) => {
    try {
      // Ambil postId dari params atau body sesuai setingan validasimu
      const validation = favoriteValidation.parse(req.body); 
      const { postId } = validation;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // 1. Cek apakah data favoritnya memang berstatus 'like' sebelumnya
      const currentFavorite = await db
        .select()
        .from(favoritesTable)
        .where(
          and(
            eq(favoritesTable.postId, postId),
            eq(favoritesTable.userId, userId),
            eq(favoritesTable.status, "like")
          )
        )
        .limit(1);

      if (currentFavorite.length === 0) {
        return res.status(404).json({
          success: false,
          message: "postingan belum disukai atau tidak ditemukan",
        });
      }

      // 2. Ubah status menjadi 'dislike' khusus untuk user ini dan post ini
      await db
        .update(favoritesTable)
        .set({ status: "dislike" })
        .where(
          and(
            eq(favoritesTable.postId, postId),
            eq(favoritesTable.userId, userId)
          )
        );

      return res.status(200).json({
        success: true,
        message: "berhasil menghapus dari favorite",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
}

export default new FavoriteController();
