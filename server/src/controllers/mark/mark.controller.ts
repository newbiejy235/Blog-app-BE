import { Request, Response } from "express";
import { db } from "../../config/db";
import { markTable, postsTable } from "../../config/schema";
import { and, eq } from "drizzle-orm";
import { markValidation } from "../../validations/mark.validation";

class MarkController {
  // ============================================================
  // ADD MARK
  // ============================================================
  postMarkUser = async (req: Request, res: Response) => {
    const validation = markValidation.parse(req.body);
    const { postId } = validation;
    const userId = (req as any).user?.id;

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

    const existing = await db
      .select()
      .from(markTable)
      .where(and(eq(markTable.userId, userId), eq(markTable.postId, postId)))
      .limit(1);

    if (existing.length > 0 && existing[0].status === "marked") {
      return res.status(409).json({
        success: false,
        message: "Post sudah ada di bookmark",
        data: { postId, status: "marked" },
      });
    }

    if (existing.length === 0) {
      // Belum pernah mark -> insert baru
      await db.insert(markTable).values({
        userId,
        postId,
        status: "marked",
      });
    } else {
      // Row sudah ada tapi statusnya "unmarked" -> update jadi marked lagi
      await db
        .update(markTable)
        .set({ status: "marked" })
        .where(eq(markTable.id, existing[0].id));
    }

    return res.status(200).json({
      success: true,
      message: "Post ditandai",
      data: { postId, status: "marked" },
    });
  };

  // ============================================================
  // REMOVE MARK
  // ============================================================
  deleteMarkUser = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const postId = Number(req.params.postId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!postId || Number.isNaN(postId)) {
      return res
        .status(400)
        .json({ success: false, message: "postId tidak valid" });
    }

    const existing = await db
      .select()
      .from(markTable)
      .where(and(eq(markTable.userId, userId), eq(markTable.postId, postId)))
      .limit(1);

    if (existing.length === 0 || existing[0].status === "unmarked") {
      return res.status(404).json({
        success: false,
        message: "Post belum ditandai",
        data: { postId, status: "unmarked" },
      });
    }

    await db
      .update(markTable)
      .set({ status: "unmarked" })
      .where(eq(markTable.id, existing[0].id));

    return res.status(200).json({
      success: true,
      message: "Tanda dihapus",
      data: { postId, status: "unmarked" },
    });
  };

  // ============================================================
  // GET SEMUA MARK USER
  // ============================================================
  getMarkUser = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

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
          eq(markTable.status, "marked"),
          eq(postsTable.status, "published"),
        ),
      );

    return res.status(200).json({
      success: true,
      message: "berhasil dapat data mark",
      data: result,
    });
  };
}

export default new MarkController();
