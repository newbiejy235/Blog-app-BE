import { Request, Response } from "express";
import { db } from "../../config/db";
import { favoritesTable } from "../../config/schema";
import { favoriteValidation } from "../../validations/favorite.validation";
import { and, count, eq } from "drizzle-orm";

export class FavoriteController {
  postFavorite = async (req: Request, res: Response) => {
    const validation = favoriteValidation.parse(req.body);
    const { userId, postId } = validation;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "silahkan login terlebih dahulu",
      });
    }

    await db.insert(favoritesTable).values({
      userId,
      postId,
    });

    return res.status(200).json({
      success: true,
      message: "berhaasil menambahkan ke favorite",
    });
  };

  getFavorite = async (req: Request, res: Response) => {
    const validation = favoriteValidation.parse(req.params);
    const { userId, postId } = validation;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "silahkan login terlebih dahulu",
      });
    }

    const like = await db
      .select({ favoriteCount: count(favoritesTable.id) })
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.postId, postId),
        ),
      );

    return res.status(200).json({
      success: true,
      message: "berhaasil menambahkan ke favorite",
      data: like,
    });
  };
}

export default new FavoriteController();
