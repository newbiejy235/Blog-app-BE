import { Request, Response } from "express";
import { db } from "../../config/db";
import { markTable, postsTable } from "../../config/schema";
import { and, eq } from "drizzle-orm";
import { markValidation } from "../../validations/mark.validation";

class MarkController {
  postMarkUser = async (req: Request, res: Response) => {
    const validation = markValidation.parse(req.body);
    const { postId } = validation;
    const userId = (req as any).user?.id; // Ambil ID user dari middleware auth

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

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

    await db.insert(markTable).values({
      userId: userId,
      postId: postId,
    });
  };

  getMarkUser = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id; // Ambil ID user dari middleware auth

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        imageUrl: postsTable.imageUrl,
        createdAt: postsTable.createdAt,
      })
      .from(markTable)
      .leftJoin(postsTable, eq(markTable.postId, postsTable.id))
      .where(
        and(
          eq(markTable.userId, userId),
          eq(postsTable.status, "published"), // Pastikan postnya masih dipublish
        ),
      );

    return res.status(200).json({
      success: true,
      message: "berhasil dapat data favorite",
      data: result,
    });
  };
}

export default new MarkController();
